package com.soulsync.service;

import com.soulsync.dto.ProfileDTO;
import com.soulsync.dto.ProfileSummaryDTO;
import com.soulsync.dto.ProfileUpdateDTO;
import com.soulsync.dto.RegisterRequestDTO;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Profile;
import com.soulsync.model.ProfileView;
import com.soulsync.model.User;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.repository.ProfileViewRepository;
import com.soulsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.List;
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
        return profileRepo.findWithFilters(excludeId, edu, gen, verified, normalizedCity, normalizedInterest, pageable)
                .map(ProfileSummaryDTO::from);
    }

    @Transactional(readOnly = true)
    public ProfileDTO getById(Long id) {
        return profileRepo.findById(id)
                .map(ProfileDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", id));
    }

    @Cacheable(value = "topPicks", key = "#excludeId")
    @Transactional(readOnly = true)
    public List<ProfileSummaryDTO> getTopPicks(Long excludeId) {
        Pageable pageable = PageRequest.of(0, 8, Sort.by("isPremium").descending().and(Sort.by("createdAt").descending()));
        String genderFilter = self.resolveGenderFilter(excludeId);
        return (excludeId != null
                ? profileRepo.findTopPicks(excludeId, genderFilter, pageable)
                : profileRepo.findTopPicks(genderFilter, pageable))
                .stream()
                .map(ProfileSummaryDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfileDTO getMe(Long profileId) {
        return profileRepo.findById(profileId)
                .map(ProfileDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId));
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
        return profileViewRepo.findViewers(profile, pageable)
                .stream()
                .map(v -> ProfileSummaryDTO.from(v.getViewer()))
                .toList();
    }

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
        if (req.getHoroscope() != null)         profile.setHoroscope(req.getHoroscope());
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
        return ProfileDTO.from(profileRepo.save(profile));
    }

    @Transactional(readOnly = true)
    public List<ProfileSummaryDTO> search(String city, String education, String gender, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return profileRepo.search(city, education, gender, pageable)
                .map(ProfileSummaryDTO::from)
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
                .horoscope(req.getHoroscope())
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
                .lookingFor(req.getPartnerDescription())
                .build();

        if (req.getDateOfBirth() != null && !req.getDateOfBirth().isBlank()) {
            try {
                profile.setDateOfBirth(LocalDate.parse(req.getDateOfBirth()));
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid date of birth format. Expected yyyy-MM-dd");
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

    private String primaryPhoto(RegisterRequestDTO req) {
        if (req.getPhotos() != null && !req.getPhotos().isEmpty()) return req.getPhotos().get(0);
        return req.getPhotoUrl();
    }

    private String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) return null;
        return String.join(",", tags);
    }
}
