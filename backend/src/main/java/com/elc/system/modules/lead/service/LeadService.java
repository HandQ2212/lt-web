package com.elc.system.modules.lead.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.repository.InvoiceRepository;
import com.elc.system.modules.finance.repository.PaymentRepository;
import com.elc.system.modules.lead.dto.LeadDto.*;
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
import java.math.BigDecimal;
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
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
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

        // Create user account immediately for manual leads
        if (lead.getUserId() == null) {
            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setFullName(request.getFullName());
                        newUser.setPhone(phone);
                        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
                        newUser.setRole(UserRole.LEAD);
                        newUser.setStatus(UserStatus.ACTIVE);
                        return userRepository.save(newUser);
                    });
            lead.setUserId(user.getId());
        }

        applyLeadDetails(lead, request, email, phone);
        leadRepository.save(lead);
        addCourseInterests(lead, request.getCourseIds(), request.getNotes());
        log.info("Lead created: {}", lead.getId());
        return mapToResponse(lead);
    }

    @Transactional
    public LeadResponse addMyInterests(User currentUser, LeadInterestRequest request) {
        Lead lead = findOrCreateLeadForUser(currentUser);
        addCourseInterests(lead, request.getCourseIds(), request.getNotes());
        lead.setStatus(LeadStatus.INTERESTED);
        leadRepository.save(lead);
        return mapToResponse(lead);
    }
    
    @Transactional
    public LeadResponse expressInterestInClass(User currentUser, UUID classId, String notes) {
        Lead lead = findOrCreateLeadForUser(currentUser);
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        if (!leadInterestRepository.existsByLeadIdAndClazzId(lead.getId(), classId)) {
            LeadInterest interest = LeadInterest.builder()
                    .lead(lead)
                    .clazz(clazz)
                    .course(clazz.getCourse())
                    .status(LeadStatus.INTERESTED)
                    .notes(notes)
                    .build();
            leadInterestRepository.save(interest);
        }

        lead.setStatus(LeadStatus.INTERESTED);
        leadRepository.save(lead);
        return mapToResponse(lead);
    }

    @Transactional
    public LeadResponse moveToConsulting(UUID leadId) {
        Lead lead = findLeadOrThrow(leadId);
        lead.setStatus(LeadStatus.CONSULTING);
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse agreeToEnroll(UUID leadId, UUID classId) {
        Lead lead = findLeadOrThrow(leadId);
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        UUID userId = lead.getUserId();
        User student;
        
        if (userId == null) {
            // Trường hợp Lead được tạo thủ công, chưa có User
            // Thử tìm User theo email trước
            student = userRepository.findByEmailIgnoreCase(lead.getEmail())
                    .orElseGet(() -> {
                        // Nếu không thấy thì tạo mới User với role LEAD
                        User newUser = new User();
                        newUser.setEmail(lead.getEmail());
                        newUser.setFullName(lead.getFullName());
                        newUser.setPhone(lead.getPhone());
                        // Mật khẩu mặc định là số điện thoại hoặc một chuỗi cố định
                        newUser.setPassword(passwordEncoder.encode(lead.getPhone() != null ? lead.getPhone() : "123456"));
                        newUser.setRole(UserRole.LEAD);
                        newUser.setStatus(UserStatus.ACTIVE);
                        return userRepository.save(newUser);
                    });
            lead.setUserId(student.getId());
            leadRepository.save(lead);
        } else {
            student = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Linked user not found"));
        }

        // Create Enrollment as PENDING
        if (!enrollmentRepository.existsByStudentIdAndClazzId(student.getId(), classId)) {
            Enrollment enrollment = Enrollment.builder()
                    .student(student)
                    .clazz(clazz)
                    .enrollmentDate(LocalDate.now())
                    .status(EnrollmentStatus.PENDING)
                    .build();
            enrollmentRepository.save(enrollment);

            // Create Invoice as UNPAID
            BigDecimal amount = clazz.getCourse().getBasePrice();
            Invoice invoice = Invoice.builder()
                    .enrollment(enrollment)
                    .amount(amount != null ? amount : BigDecimal.ZERO)
                    .totalAmount(amount != null ? amount : BigDecimal.ZERO)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(amount != null ? amount : BigDecimal.ZERO)
                    .dueDate(LocalDate.now().plusDays(7))
                    .status(InvoiceStatus.UNPAID)
                    .build();
            invoiceRepository.save(invoice);
        }

        lead.setStatus(LeadStatus.AGREED);
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse confirmCashPayment(UUID leadId) {
        Lead lead = findLeadOrThrow(leadId);
        
        if (lead.getUserId() == null) {
            throw new IllegalArgumentException("Lead does not have a linked user");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(lead.getUserId());
        if (enrollments.isEmpty()) {
            throw new IllegalArgumentException("No enrollment found for this lead");
        }
        
        Enrollment latest = enrollments.get(enrollments.size() - 1);
        latest.setStatus(EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(latest);

        List<Invoice> invoices = invoiceRepository.findByEnrollmentId(latest.getId());
        if (invoices.isEmpty()) {
            throw new IllegalArgumentException("No invoice found for the enrollment");
        }

        Invoice invoice = invoices.get(invoices.size() - 1);
        
        // Create Payment record for Cash payment
        com.elc.system.modules.finance.entity.Payment payment = com.elc.system.modules.finance.entity.Payment.builder()
                .invoice(invoice)
                .amount(invoice.getFinalAmount())
                .paymentDate(ZonedDateTime.now())
                .paymentMethod(com.elc.system.modules.finance.entity.PaymentMethod.CASH)
                .notes("Thu tiền mặt trực tiếp từ Lead Management")
                .build();
        paymentRepository.save(payment);

        invoice.setStatus(InvoiceStatus.PAID);
        invoiceRepository.save(invoice);

        lead.setStatus(LeadStatus.PAID);
        log.info("Cash payment confirmed for lead: {}. Invoice: {}, Enrollment: {}", leadId, invoice.getId(), latest.getId());
        
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse rejectLead(UUID leadId) {
        Lead lead = findLeadOrThrow(leadId);
        lead.setStatus(LeadStatus.NEW);
        
        // Xóa các mục đang quan tâm
        List<LeadInterest> interests = leadInterestRepository.findByLeadId(leadId);
        leadInterestRepository.deleteAll(interests);
        
        return mapToResponse(leadRepository.save(lead));
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
    public LeadConversionResponse convertLeadToStudent(UUID leadId) {
        Lead lead = findLeadOrThrow(leadId);

        if (lead.getStatus() != LeadStatus.PAID) {
            throw new IllegalArgumentException("Lead must pay before converting to student");
        }

        User user = userRepository.findById(lead.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Linked user not found"));
        
        user.setRole(UserRole.STUDENT);
        userRepository.save(user);

        lead.setStatus(LeadStatus.CONVERTED);
        leadRepository.save(lead);

        log.info("Lead {} converted to student {}", leadId, user.getId());

        return LeadConversionResponse.builder()
                .leadId(lead.getId())
                .leadStatus(lead.getStatus())
                .studentId(user.getId())
                .studentEmail(user.getEmail())
                .message("Lead converted to student successfully")
                .build();
    }

    private Lead findLeadOrThrow(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + id));
    }

    private LeadResponse mapToResponse(Lead lead) {
        UUID enrollmentId = null;
        UUID invoiceId = null;

        if (lead.getUserId() != null) {
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(lead.getUserId());
            if (!enrollments.isEmpty()) {
                // Lấy enrollment mới nhất (cuối danh sách)
                Enrollment latest = enrollments.get(enrollments.size() - 1);
                enrollmentId = latest.getId();

                List<Invoice> invoices = invoiceRepository.findByEnrollmentId(enrollmentId);
                if (!invoices.isEmpty()) {
                    invoiceId = invoices.get(invoices.size() - 1).getId();
                }
            }
        }

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
                .currentEnrollmentId(enrollmentId)
                .currentInvoiceId(invoiceId)
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

    private List<LeadInterestResponse> mapInterests(UUID leadId) {
        return leadInterestRepository.findByLeadId(leadId).stream()
                .map(this::mapInterest)
                .toList();
    }

    private LeadInterestResponse mapInterest(LeadInterest interest) {
        Course course = interest.getCourse();
        Clazz clazz = interest.getClazz();
        return LeadInterestResponse.builder()
                .id(interest.getId())
                .courseId(course != null ? course.getId() : (clazz != null ? clazz.getCourse().getId() : null))
                .courseName(course != null ? course.getName() : (clazz != null ? clazz.getCourse().getName() : null))
                .clazzId(clazz != null ? clazz.getId() : null)
                .clazzName(clazz != null ? clazz.getName() : null)
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
