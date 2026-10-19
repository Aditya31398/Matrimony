package com.soulsync.service;

import com.soulsync.dto.ProfileSummaryDTO;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Block;
import com.soulsync.model.Profile;
import com.soulsync.model.Report;
import com.soulsync.repository.BlockRepository;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Blocking and reporting members. */
@Slf4j
@Service
@RequiredArgsConstructor
public class SafetyService {

    private final BlockRepository blockRepo;
    private final ReportRepository reportRepo;
    private final ProfileRepository profileRepo;
    private final EmailService emailService;

    /** Throws when either member has blocked the other. */
    public void assertNotBlocked(Long a, Long b) {
        if (blockRepo.existsByBlockerIdAndBlockedId(a, b) || blockRepo.existsByBlockerIdAndBlockedId(b, a)) {
            throw new IllegalArgumentException("You can't interact with this member");
        }
    }

    public boolean hasBlocked(Long blockerId, Long blockedId) {
        return blockRepo.existsByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    @Transactional
    public void block(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) throw new IllegalArgumentException("You can't block yourself");
        if (blockRepo.existsByBlockerIdAndBlockedId(blockerId, blockedId)) return;
        blockRepo.save(Block.builder().blocker(profile(blockerId)).blocked(profile(blockedId)).build());
    }

    @Transactional
    public void unblock(Long blockerId, Long blockedId) {
        blockRepo.findByBlockerIdAndBlockedId(blockerId, blockedId).ifPresent(blockRepo::delete);
    }

    @Transactional(readOnly = true)
    public List<ProfileSummaryDTO> blocked(Long blockerId) {
        return blockRepo.findByBlockerIdOrderByCreatedAtDesc(blockerId).stream()
                .map(b -> {
                    Profile p = b.getBlocked();
                    return ProfileSummaryDTO.builder()
                            .id(p.getId()).firstName(p.getFirstName()).lastName(p.getLastName())
                            .age(p.getAge()).restricted(true).interests(List.of())
                            .build();
                })
                .toList();
    }

    @Transactional
    public void report(Long reporterId, Long reportedId, Report.Reason reason, String details, boolean alsoBlock) {
        if (reporterId.equals(reportedId)) throw new IllegalArgumentException("You can't report yourself");
        Profile reporter = profile(reporterId), reported = profile(reportedId);
        String trimmed = details == null ? null : details.trim();
        if (trimmed != null && trimmed.length() > 1000) trimmed = trimmed.substring(0, 1000);
        Report saved = reportRepo.save(Report.builder()
                .reporter(reporter).reported(reported).reason(reason).details(trimmed).build());
        if (alsoBlock) block(reporterId, reportedId);
        log.warn("Report #{}: profile {} reported profile {} for {}", saved.getId(), reporterId, reportedId, reason);
        emailService.sendReportAlert(saved.getId(), reported.getId(), reported.getFirstName(), reason.name(), trimmed);
    }

    private Profile profile(Long id) {
        return profileRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Profile", id));
    }
}
