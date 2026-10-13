package com.soulsync.service;

import com.soulsync.dto.ProfileDTO;
import com.soulsync.dto.ProfileSummaryDTO;
import com.soulsync.dto.ProfileUpdateDTO;
import com.soulsync.dto.RegisterRequestDTO;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Profile;
import com.soulsync.model.ProfileView;
import com.soulsync.model.User;
import com.soulsync.repository.BlockRepository;
import com.soulsync.repository.MatchRepository;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.repository.ProfileViewRepository;
import com.soulsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepo;
    private final ProfileViewRepository profileViewRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ViewerContextService viewerContextService;
    private final ProfileCardMapper cardMapper;
    private final MatchScoreService matchScoreService;
    private final MatchRepository matchRepo;
    private final BlockRepository blockRepo;

    // Self-injection via @Lazy proxy so @Cacheable on resolveGenderFilter goes through AOP
    @Autowired @Lazy
    private ProfileService self;

    @Transactional(readOnly = true)
    public Page<ProfileSummaryDTO> getAll(int page, int size, String education, String gender,
                                          boolean verified, String sort, String city,
                                          String interest, Long excludeId) {
        Sort jpaSort = "recent".equalsIgnoreCase(sort)
                ? Sort.by("createdAt").descending()
                : Sort.by("isPremium").descending().and(Sort.by("createdAt").descending());
        Pageable pageable = PageRequest.of(page, size, jpaSort);
        String edu = normalizeEducation(education);
        String gen = (gender == null || gender.isBlank())
                ? self.resolveGenderFilter(excludeId)
                : gender;
        String normalizedInterest = (interest == null || interest.isBlank()) ? null : interest.trim();
        String normalizedCity = (city == null || city.isBlank()) ? null : city.trim();
        ViewerContext ctx = viewerContextService.forProfile(excludeId);
        return profileRepo.findWithFilters(excluded(ctx), edu, gen, verified, normalizedCity, normalizedInterest, pageable)
                .map(p -> cardMapper.summary(p, ctx));
    }

    /** Free members see only photo, name, age, caste and religion of other profiles. */
    @Transactional(readOnly = true)
    public ProfileDTO getById(Long id, Long viewerId) {
        Profile profile = profileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", id));
        // Someone who blocked you simply doesn't exist for you
        if (blockRepo.existsByBlockerIdAndBlockedId(id, viewerId)) throw new ResourceNotFoundException("Profile", id);
        ProfileDTO dto = cardMapper.detail(profile, viewerContextService.forProfile(viewerId));
        dto.setBlockedByMe(blockRepo.existsByBlockerIdAndBlockedId(viewerId, id));
        return dto;
    }

    /** Match % with a breakdown; free members get the score but not premium-only details. */
    @Transactional(readOnly = true)
    public MatchScoreService.Score getMatchScore(Long viewerId, Long id) {
        Profile profile = profileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", id));
        ViewerContext ctx = viewerContextService.forProfile(viewerId);
        if (ctx.isHidden(id)) throw new ResourceNotFoundException("Profile", id);
        return matchScoreService.score(ctx, profile);
    }

    /**
     * Five strong matches per day. The best-scoring candidates the member hasn't already
     * requested or answered are shuffled with a per-day seed, so the set rotates daily.
     */
    @Transactional(readOnly = true)
    public List<ProfileSummaryDTO> getDailyPicks(Long viewerId) {
        ViewerContext ctx = viewerContextService.forProfile(viewerId);
        Set<Long> skip = new HashSet<>(excluded(ctx));
        skip.addAll(matchRepo.findInteractedIds(viewerId));
        String gender = self.resolveGenderFilter(viewerId);
        long daySeed = LocalDate.now().toEpochDay() * 31 + viewerId;

        return profileRepo.findWithFilters(skip, null, gender, false, null, null,
                        PageRequest.of(0, 200, Sort.by("createdAt").descending()))
                .stream()
                .map(p -> cardMapper.summary(p, ctx))
                .sorted(Comparator.comparing((ProfileSummaryDTO d) -> d.getMatchScore() == null ? -1 : d.getMatchScore())
                        .reversed())
                .limit(15)
                .sorted(Comparator.comparingLong(d -> Long.hashCode(d.getId() * 2654435761L ^ daySeed)))
                .limit(5)
                .sorted(Comparator.comparing((ProfileSummaryDTO d) -> d.getMatchScore() == null ? -1 : d.getMatchScore())
                        .reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isPremium(Long profileId) {
        if (profileId == null) return false;
        return profileRepo.findById(profileId).map(Profile::hasActivePremium).orElse(false);
    }

    @Transactional(readOnly = true)
    public List<ProfileSummaryDTO> getTopPicks(Long excludeId) {
        Pageable pageable = PageRequest.of(0, 8, Sort.by("isPremium").descending().and(Sort.by("createdAt").descending()));
        ViewerContext ctx = viewerContextService.forProfile(excludeId);
        return profileRepo.findTopPicks(excluded(ctx), self.resolveGenderFilter(excludeId), pageable)
                .stream()
                .map(p -> cardMapper.summary(p, ctx))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfileDTO getMe(Long profileId) {
        ViewerContext ctx = viewerContextService.forProfile(profileId);
        return cardMapper.detail(ctx.viewer(), ctx);
    }

    @Transactional
    public void recordView(Long viewerId, Long viewedId) {
        if (viewerId == null || viewerId.equals(viewedId)) return;
        Profile viewer = profileRepo.findById(viewerId).orElse(null);
        Profile viewed = profileRepo.findById(viewedId).orElse(null);
        if (viewer == null || viewed == null) return;
        profileViewRepo.findByViewerAndViewed(viewer, viewed).ifPresentOrElse(
            v -> { v.setViewedAt(LocalDateTime.now()); profileViewRepo.save(v); },
            () -> profileViewRepo.save(ProfileView.builder()
                    .viewer(viewer).viewed(viewed).viewedAt(LocalDateTime.now()).build())
        );
    }

    @Transactional(readOnly = true)
    public List<ProfileSummaryDTO> getViewers(Long profileId) {
        Profile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId));
        Pageable pageable = PageRequest.of(0, 20, Sort.by("viewedAt").descending());
        ViewerContext ctx = viewerContextService.forProfile(profileId);
        return profileViewRepo.findViewers(profile, pageable)
                .stream()
                .filter(v -> !ctx.isHidden(v.getViewer().getId()))
                .map(v -> cardMapper.summary(v.getViewer(), ctx))
                .toList();
    }

    /** Evicts the cached "looking for" filter so Discover reflects the change straight away. */
    @CacheEvict(value = "genderFilter", key = "#id")
    @Transactional
    public ProfileDTO update(Long id, ProfileUpdateDTO req) {
        Profile profile = profileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", id));
        if (req.getFirstName() != null)         profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null)          profile.setLastName(req.getLastName());
        if (req.getCity() != null)              profile.setCity(req.getCity());
        if (req.getState() != null)             profile.setState(req.getState());
        if (req.getProfession() != null)        profile.setProfession(req.getProfession());
        if (req.getReligion() != null)          profile.setReligion(req.getReligion());
        if (req.getCaste() != null)             profile.setCaste(req.getCaste());
        if (req.getHeight() != null)            profile.setHeight(req.getHeight());
        if (req.getMotherTongue() != null)      profile.setMotherTongue(req.getMotherTongue());
        if (req.getDietaryPreference() != null) profile.setDietaryPreference(req.getDietaryPreference());
        if (req.getPhone() != null)             profile.setPhone(blankToNull(req.getPhone()));
        if (req.getPhotoPrivate() != null)      profile.setPhotoPrivate(req.getPhotoPrivate());
        if (req.getEducation() != null)         profile.setEducation(req.getEducation());
        if (req.getBio() != null)               profile.setBio(req.getBio());
        if (req.getLookingForGender() != null)  profile.setLookingForGender(req.getLookingForGender());
        if (req.getAgeMin() != null)            profile.setAgeMin(req.getAgeMin());
        if (req.getAgeMax() != null)            profile.setAgeMax(req.getAgeMax());
        if (req.getPartnerDescription() != null) profile.setLookingFor(req.getPartnerDescription());
        if (req.getPhotos() != null && !req.getPhotos().isEmpty()) {
            profile.setPhotoUrl(req.getPhotos().get(0));
            profile.setPhotos(joinTags(req.getPhotos()));
        } else if (req.getPhotoUrl() != null) {
            profile.setPhotoUrl(req.getPhotoUrl());
        }
        if (req.getInterests() != null)  profile.setInterests(joinTags(req.getInterests()));
        if (req.getLifestyle() != null)  profile.setLifestyle(joinTags(req.getLifestyle()));
        if (req.getNakshatra() != null)  profile.setNakshatra(req.getNakshatra());
        if (req.getRashi() != null)      profile.setRashi(req.getRashi());
        if (req.getIsManglik() != null)  profile.setIsManglik(req.getIsManglik());
        if (req.getMatchingTradition() != null) profile.setMatchingTradition(normalizeTradition(req.getMatchingTradition()));
        if (req.getPapaPoints() != null) profile.setPapaPoints(req.getPapaPoints());
        profileRepo.save(profile);
        return getMe(id);
    }

    @Transactional(readOnly = true)
    public List<ProfileSummaryDTO> search(String city, String education, String gender, int page, int size,
                                          Long viewerId) {
        Pageable pageable = PageRequest.of(page, size);
        ViewerContext ctx = viewerContextService.forProfile(viewerId);
        return profileRepo.search(excluded(ctx), city, education, gender, pageable)
                .map(p -> cardMapper.summary(p, ctx))
                .toList();
    }

    @Transactional
    public ProfileDTO register(RegisterRequestDTO req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + req.getEmail());
        }

        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .emailVerified(false)
                .verificationToken(passwordEncoder.encode(otp)) // store hashed OTP
                .tokenExpiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        user = userRepo.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .city(req.getCity())
                .state(req.getState())
                .profession(req.getProfession())
                .religion(req.getReligion())
                .caste(req.getCaste())
                .height(req.getHeight())
                .motherTongue(req.getMotherTongue())
                .dietaryPreference(req.getDietaryPreference())
                .phone(blankToNull(req.getPhone()))
                .education(req.getEducation())
                .bio(req.getBio())
                .lookingForGender(req.getLookingForGender())
                .ageMin(req.getAgeMin())
                .ageMax(req.getAgeMax())
                .photoUrl(primaryPhoto(req))
                .photos(joinTags(req.getPhotos()))
                .isVerified(false)
                .isPremium(false)
                .interests(joinTags(req.getInterests()))
                .lifestyle(joinTags(req.getLifestyle()))
                .nakshatra(req.getNakshatra())
                .rashi(req.getRashi())
                .isManglik(req.getIsManglik())
                .matchingTradition(normalizeTradition(req.getMatchingTradition()))
                .papaPoints(req.getPapaPoints())
                .lookingFor(req.getPartnerDescription())
                .build();

        if (req.getDateOfBirth() != null && !req.getDateOfBirth().isBlank()) {
            try {
                profile.setDateOfBirth(LocalDate.parse(req.getDateOfBirth()));
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid date of birth format. Expected yyyy-MM-dd");
            }
            if (profile.getAge() < 18) {
                throw new IllegalArgumentException("You must be at least 18 years old to register");
            }
        }

        if (req.getGender() != null) {
            try {
                profile.setGender(switch (req.getGender().toUpperCase()) {
                    case "MAN", "MALE" -> Profile.Gender.MALE;
                    case "WOMAN", "FEMALE" -> Profile.Gender.FEMALE;
                    default -> Profile.Gender.NON_BINARY;
                });
            } catch (Exception ignored) {}
        }

        ProfileDTO saved = ProfileDTO.from(profileRepo.save(profile));
        emailService.sendOtpEmail(req.getEmail(), req.getFirstName(), otp);
        return saved;
    }

    @Cacheable(value = "genderFilter", key = "#profileId")
    public String resolveGenderFilter(Long profileId) {
        if (profileId == null) return null;
        return profileRepo.findById(profileId).map(p -> {
            String looking = p.getLookingForGender();
            if (looking == null) return null;
            return switch (looking.toLowerCase()) {
                case "man", "male" -> "MALE";
                case "woman", "female" -> "FEMALE";
                default -> null;
            };
        }).orElse(null);
    }

    private String normalizeEducation(String education) {
        if (education == null || education.isBlank() || education.equalsIgnoreCase("Any Education")) return null;
        // Map dropdown labels to key search terms that match free-form DB entries
        return switch (education.toLowerCase()) {
            case "masters degree" -> "Masters";
            case "phd / doctorate", "phd/doctorate", "phd" -> "PhD";
            case "bachelors degree" -> "Bachelor";
            case "high school" -> "High School";
            default -> education;
        };
    }

    /** The viewer plus everyone blocked either way — never empty, as JPQL NOT IN requires. */
    private static Set<Long> excluded(ViewerContext ctx) {
        Set<Long> ids = new HashSet<>(ctx.hiddenIds());
        ids.add(ctx.viewerId());
        return ids;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private String primaryPhoto(RegisterRequestDTO req) {
        if (req.getPhotos() != null && !req.getPhotos().isEmpty()) return req.getPhotos().get(0);
        return req.getPhotoUrl();
    }

    private String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) return null;
        return String.join(",", tags);
    }
    /** "AUTO"/blank → null (decide from language); otherwise upper-cased tradition name. */
    private static String normalizeTradition(String t) {
        if (t == null || t.isBlank() || "AUTO".equalsIgnoreCase(t)) return null;
        return t.trim().toUpperCase();
    }

}
