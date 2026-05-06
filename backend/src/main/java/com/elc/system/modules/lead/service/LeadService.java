package com.elc.system.modules.lead.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.lead.dto.LeadDto.ConvertLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.CreateLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.LeadConversionResponse;
import com.elc.system.modules.lead.dto.LeadDto.LeadInterestRequest;
import com.elc.system.modules.lead.dto.LeadDto.LeadInterestResponse;
import com.elc.system.modules.lead.dto.LeadDto.LeadResponse;
import com.elc.system.modules.lead.dto.LeadDto.UpdateLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.UpdateLeadStatusRequest;
import com.elc.system.modules.lead.entity.Lead;
import com.elc.system.modules.lead.entity.LeadInterest;
import com.elc.system.modules.lead.entity.LeadSource;
import com.elc.system.modules.lead.entity.LeadStatus;
import com.elc.system.modules.lead.repository.LeadInterestRepository;
import com.elc.system.modules.lead.repository.LeadRepository;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.entity.EnrollmentStatus;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import com.elc.system.modules.sms.entity.Course;
import com.elc.system.modules.sms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadInterestRepository leadInterestRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClazzRepository clazzRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LeadResponse createLead(CreateLeadRequest request) {
        String email = normalizeBlankToNull(request.getEmail());
        String phone = normalizeRequired(request.getPhone());

        Lead lead = findExistingLead(email, phone)
                .orElseGet(() -> Lead.builder()
                        .fullName(request.getFullName())
                        .email(email)
                        .phone(phone)
                        .status(request.getStatus() != null ? request.getStatus() : LeadStatus.NEW)
                        .source(request.getSource() != null ? request.getSource() : LeadSource.WEBSITE_FORM)
                        .build());

        applyLeadDetails(lead, request, email, phone);
        leadRepository.save(lead);
        addCourseInterests(lead, request.getCourseIds(), request.getNotes());
        log.info("Lead created: {}", lead.getId());
        return mapToResponse(lead);
    }
 
    @Transactional(readOnly = true)
    public Page<LeadResponse> getLeads(LeadStatus status,
                                       LeadSource source,
                                       LocalDate fromDate,
                                       LocalDate toDate,
                                       Pageable pageable) {
        ZonedDateTime from = fromDate != null
                ? fromDate.atStartOfDay(ZoneId.systemDefault())
                : null;
        ZonedDateTime to = toDate != null
                ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).minusNanos(1)
                : null;

        Pageable safePageable = normalizeLeadPageable(pageable);

        return leadRepository.findAll(buildLeadSpecification(status, source, from, to), safePageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(UUID id) {
        return mapToResponse(findLeadOrThrow(id));
    }

    @Transactional
    public LeadResponse getCurrentLead(User currentUser) {
        return mapToResponse(findOrCreateLeadForUser(currentUser));
    }

    @Transactional
    public LeadResponse addCurrentLeadInterests(User currentUser, LeadInterestRequest request) {
        Lead lead = findOrCreateLeadForUser(currentUser);
        addCourseInterests(lead, request.getCourseIds(), request.getNotes());
        return mapToResponse(lead);
    }

    @Transactional
    public LeadResponse updateLead(UUID id, UpdateLeadRequest request) {
        Lead lead = findLeadOrThrow(id);

        lead.setFullName(request.getFullName());
        lead.setEmail(normalizeBlankToNull(request.getEmail()));
        lead.setPhone(request.getPhone());
        lead.setDateOfBirth(request.getDateOfBirth());
        lead.setGender(request.getGender());
        lead.setAddress(request.getAddress());
        lead.setPreferredLevel(request.getPreferredLevel());
        lead.setAssessmentScore(request.getAssessmentScore());
        lead.setStatus(request.getStatus() != null ? request.getStatus() : lead.getStatus());
        lead.setSource(request.getSource() != null ? request.getSource() : lead.getSource());
        lead.setBranchId(request.getBranchId());
        lead.setNotes(request.getNotes());

        leadRepository.save(lead);
        addCourseInterests(lead, request.getCourseIds(), request.getNotes());
        log.info("Lead updated: {}", lead.getId());
        return mapToResponse(lead);
    }
 
    @Transactional
    public LeadResponse updateLeadStatus(UUID id, UpdateLeadStatusRequest request) {
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Lead status is required");
        }

        Lead lead = findLeadOrThrow(id);
        lead.setStatus(request.getStatus());

        leadRepository.save(lead);
        log.info("Lead status updated: {} -> {}", lead.getId(), lead.getStatus());
        return mapToResponse(lead);
    }

    @Transactional
    public void deleteLead(UUID id) {
        Lead lead = findLeadOrThrow(id);
        leadRepository.delete(lead);
        log.info("Lead deleted: {}", id);
    }

    @Transactional
    public LeadConversionResponse convertLeadToStudent(UUID leadId, ConvertLeadRequest request) {
        Lead lead = findLeadOrThrow(leadId);

        if (lead.getStatus() == LeadStatus.CONVERTED || lead.getStatus() == LeadStatus.ENROLLED) {
            throw new IllegalArgumentException("Lead is already converted to student");
        }

        Clazz clazz = clazzRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        User student = resolveStudentUser(lead, request);
        student.setRole(UserRole.STUDENT);
        student.setStatus(UserStatus.ACTIVE);
        userRepository.save(student);

        if (enrollmentRepository.existsByStudentIdAndClazzId(student.getId(), clazz.getId())) {
            throw new IllegalArgumentException("Student is already enrolled in this class");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .clazz(clazz)
                .enrollmentDate(LocalDate.now())
                .status(EnrollmentStatus.ACTIVE)
                .build();
        enrollmentRepository.save(enrollment);

        lead.setStatus(LeadStatus.CONVERTED);
        lead.setUserId(student.getId());
        if ((lead.getEmail() == null || lead.getEmail().isBlank()) && student.getEmail() != null) {
            lead.setEmail(student.getEmail());
        }
        leadRepository.save(lead);

        log.info("Lead {} converted to student {}", leadId, student.getId());

        return LeadConversionResponse.builder()
                .leadId(lead.getId())
                .leadStatus(lead.getStatus())
                .studentId(student.getId())
                .studentEmail(student.getEmail())
                .classId(clazz.getId())
                .enrollmentId(enrollment.getId())
                .message("Lead converted to student successfully")
                .build();
    }

    private Lead findLeadOrThrow(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + id));
    }

    private LeadResponse mapToResponse(Lead lead) {
        return LeadResponse.builder()
                .id(lead.getId())
                .fullName(lead.getFullName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .dateOfBirth(lead.getDateOfBirth())
                .gender(lead.getGender())
                .address(lead.getAddress())
                .preferredLevel(lead.getPreferredLevel())
                .assessmentScore(lead.getAssessmentScore())
                .status(lead.getStatus())
                .source(lead.getSource())
                .branchId(lead.getBranchId())
                .userId(lead.getUserId())
                .notes(lead.getNotes())
                .interests(mapInterests(lead.getId()))
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }

    private String normalizeBlankToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeRequired(String value) {
        return value == null ? null : value.trim();
    }

    private Optional<Lead> findExistingLead(String email, String phone) {
        if (email != null) {
            Optional<Lead> byEmail = leadRepository.findByEmailIgnoreCase(email);
            if (byEmail.isPresent()) {
                return byEmail;
            }
        }

        if (phone != null && !phone.isBlank()) {
            return leadRepository.findByPhone(phone);
        }

        return Optional.empty();
    }

    private Lead findOrCreateLeadForUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Authenticated user is required");
        }

        Optional<Lead> existing = leadRepository.findByUserId(user.getId());

        if (existing.isEmpty()) {
            String email = normalizeBlankToNull(user.getEmail());
            if (email != null) {
                existing = leadRepository.findByEmailIgnoreCase(email);
            }
        }

        if (existing.isEmpty()) {
            String phone = normalizeBlankToNull(user.getPhone());
            if (phone != null) {
                existing = leadRepository.findByPhone(phone);
            }
        }

        return existing
                .map(lead -> syncLeadWithUser(lead, user))
                .orElseGet(() -> createLeadForUser(user));
    }

    private Lead syncLeadWithUser(Lead lead, User user) {
        boolean changed = false;

        if (lead.getUserId() == null) {
            lead.setUserId(user.getId());
            changed = true;
        }
        if ((lead.getFullName() == null || lead.getFullName().isBlank()) && user.getFullName() != null) {
            lead.setFullName(user.getFullName());
            changed = true;
        }
        if ((lead.getEmail() == null || lead.getEmail().isBlank()) && user.getEmail() != null) {
            lead.setEmail(user.getEmail().trim().toLowerCase());
            changed = true;
        }
        if ((lead.getPhone() == null || lead.getPhone().isBlank()) && user.getPhone() != null) {
            lead.setPhone(user.getPhone().trim());
            changed = true;
        }

        return changed ? leadRepository.save(lead) : lead;
    }

    private Lead createLeadForUser(User user) {
        String phone = normalizeBlankToNull(user.getPhone());
        if (phone == null) {
            throw new IllegalArgumentException("Please update your phone number before choosing interested courses");
        }

        Lead lead = Lead.builder()
                .fullName(user.getFullName() != null ? user.getFullName() : user.getEmail())
                .email(normalizeBlankToNull(user.getEmail()))
                .phone(phone)
                .status(LeadStatus.NEW)
                .source(LeadSource.WEBSITE_FORM)
                .branchId(user.getBranchId())
                .userId(user.getId())
                .build();

        return leadRepository.save(lead);
    }

    private void applyLeadDetails(Lead lead, CreateLeadRequest request, String email, String phone) {
        lead.setFullName(request.getFullName() != null ? request.getFullName() : lead.getFullName());
        lead.setEmail(email != null ? email : lead.getEmail());
        lead.setPhone(phone != null ? phone : lead.getPhone());
        lead.setDateOfBirth(request.getDateOfBirth() != null ? request.getDateOfBirth() : lead.getDateOfBirth());
        lead.setGender(request.getGender() != null ? request.getGender() : lead.getGender());
        lead.setAddress(request.getAddress() != null ? request.getAddress() : lead.getAddress());
        lead.setPreferredLevel(request.getPreferredLevel() != null ? request.getPreferredLevel() : lead.getPreferredLevel());
        lead.setAssessmentScore(request.getAssessmentScore() != null ? request.getAssessmentScore() : lead.getAssessmentScore());
        lead.setStatus(request.getStatus() != null ? request.getStatus() : lead.getStatus());
        lead.setSource(request.getSource() != null ? request.getSource() : lead.getSource());
        lead.setBranchId(request.getBranchId() != null ? request.getBranchId() : lead.getBranchId());
        lead.setNotes(request.getNotes() != null ? request.getNotes() : lead.getNotes());
    }

    private void addCourseInterests(Lead lead, List<UUID> courseIds, String notes) {
        if (courseIds == null || courseIds.isEmpty()) {
            return;
        }

        for (UUID courseId : courseIds) {
            if (courseId == null || leadInterestRepository.existsByLeadIdAndCourseId(lead.getId(), courseId)) {
                continue;
            }

            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));

            LeadInterest interest = LeadInterest.builder()
                    .lead(lead)
                    .course(course)
                    .status(LeadStatus.NEW)
                    .notes(notes)
                    .build();
            leadInterestRepository.save(interest);
        }
    }

    private User resolveStudentUser(Lead lead, ConvertLeadRequest request) {
        if (lead.getUserId() != null) {
            return userRepository.findById(lead.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Linked user not found"));
        }

        String email = normalizeBlankToNull(request.getEmail());
        if (email == null) {
            email = normalizeBlankToNull(lead.getEmail());
        }

        if (email == null) {
            throw new IllegalArgumentException("Email is required to convert lead without linked account");
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required to create student account for this lead");
        }

        return User.builder()
                .email(email.toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(lead.getFullName())
                .phone(lead.getPhone())
                .dateOfBirth(lead.getDateOfBirth())
                .gender(lead.getGender())
                .address(lead.getAddress())
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .branchId(lead.getBranchId())
                .build();
    }

    private List<LeadInterestResponse> mapInterests(UUID leadId) {
        return leadInterestRepository.findByLeadId(leadId).stream()
                .map(this::mapInterest)
                .toList();
    }

    private LeadInterestResponse mapInterest(LeadInterest interest) {
        Course course = interest.getCourse();
        return LeadInterestResponse.builder()
                .id(interest.getId())
                .courseId(course != null ? course.getId() : null)
                .courseName(course != null ? course.getName() : null)
                .status(interest.getStatus())
                .notes(interest.getNotes())
                .createdAt(interest.getCreatedAt())
                .build();
    }

    private Pageable normalizeLeadPageable(Pageable pageable) {
        int page = pageable == null ? 0 : pageable.getPageNumber();
        int size = pageable == null ? 20 : Math.min(Math.max(pageable.getPageSize(), 1), 200);
        Sort sort = pageable != null && pageable.getSort().isSorted()
                ? pageable.getSort()
                : Sort.by(Sort.Direction.DESC, "createdAt");

        return PageRequest.of(page, size, sort);
    }

    private Specification<Lead> buildLeadSpecification(LeadStatus status,
                                                       LeadSource source,
                                                       ZonedDateTime from,
                                                       ZonedDateTime to) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (source != null) {
                predicates.add(criteriaBuilder.equal(root.get("source"), source));
            }

            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (to != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
