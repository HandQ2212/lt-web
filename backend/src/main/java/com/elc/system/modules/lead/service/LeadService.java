package com.elc.system.modules.lead.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.entity.Payment;
import com.elc.system.modules.finance.entity.PaymentMethod;
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
import com.elc.system.modules.sms.entity.Level;
import com.elc.system.modules.sms.repository.CourseRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadInterestRepository leadInterestRepository;
    private final UserRepository userRepository;
    private final ClazzRepository clazzRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.elc.system.core.service.EmailService emailService;

    public LeadService(LeadRepository leadRepository,
                       LeadInterestRepository leadInterestRepository,
                       UserRepository userRepository,
                       ClazzRepository clazzRepository,
                       CourseRepository courseRepository,
                       EnrollmentRepository enrollmentRepository,
                       InvoiceRepository invoiceRepository,
                       PaymentRepository paymentRepository,
                       PasswordEncoder passwordEncoder,
                       com.elc.system.core.service.EmailService emailService) {
        this.leadRepository = leadRepository;
        this.leadInterestRepository = leadInterestRepository;
        this.userRepository = userRepository;
        this.clazzRepository = clazzRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

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
        saveCourseInterests(lead, request.getCourseIds(), request.getNotes());
        ensureLeadUserIfPossible(lead, request.getPassword());
        log.info("Lead created: {}", lead.getId());

        if (lead.getSource() == LeadSource.WEBSITE_FORM && lead.getEmail() != null) {
            emailService.sendSimpleEmail(
                    lead.getEmail(),
                    "Cảm ơn bạn đã liên hệ với ELC",
                    "Chào " + lead.getFullName() + ",\n\nCảm ơn bạn đã quan tâm đến các khóa học tại ELC. Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ lại sớm nhất.\n\nTrân trọng,\nĐội ngũ ELC"
            );
        }

        return mapToResponse(lead);
    }

    @Transactional
    public LeadResponse addMyInterests(User currentUser, LeadInterestRequest request) {
        Lead lead = findOrCreateLeadForUser(currentUser);
        if (!hasInterestTarget(request)) {
            throw new IllegalArgumentException("At least one course or class is required");
        }

        saveCourseInterests(lead, request.getCourseIds(), request.getNotes());
        if (request.getClassId() != null) {
            saveClassInterest(lead, request.getClassId(), request.getNotes());
        }

        lead.setStatus(LeadStatus.INTERESTED);
        lead.setNotes(firstNonBlank(request.getNotes(), lead.getNotes()));
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse expressInterestInClass(User currentUser, UUID classId, String notes) {
        Lead lead = findOrCreateLeadForUser(currentUser);
        saveClassInterest(lead, classId, notes);
        lead.setStatus(LeadStatus.INTERESTED);
        lead.setNotes(firstNonBlank(notes, lead.getNotes()));
        return mapToResponse(leadRepository.save(lead));
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
        User student = resolveOrCreateLeadUser(lead);

        if (!enrollmentRepository.existsByStudentIdAndClazzId(student.getId(), classId)) {
            Enrollment enrollment = Enrollment.builder()
                    .student(student)
                    .clazz(clazz)
                    .enrollmentDate(LocalDate.now())
                    .status(EnrollmentStatus.PENDING)
                    .build();
            enrollmentRepository.save(enrollment);

            BigDecimal amount = clazz.getLevel() != null && clazz.getLevel().getBasePrice() != null
                    ? clazz.getLevel().getBasePrice()
                    : BigDecimal.ZERO;
            invoiceRepository.save(Invoice.builder()
                    .enrollment(enrollment)
                    .totalAmount(amount)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(amount)
                    .dueDate(LocalDate.now().plusDays(7))
                    .status(InvoiceStatus.UNPAID)
                    .build());
        }

        lead.setStatus(LeadStatus.AGREED);
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse confirmCashPayment(UUID leadId) {
        Lead lead = findLeadOrThrow(leadId);
        User user = findLinkedUser(lead)
                .orElseThrow(() -> new IllegalArgumentException("Khách hàng chưa có tài khoản người dùng liên kết"));
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(user.getId());
        if (enrollments.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy thông tin ghi danh cho khách hàng này");
        }

        Enrollment latest = enrollments.get(enrollments.size() - 1);
        latest.setStatus(EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(latest);

        List<Invoice> invoices = invoiceRepository.findByEnrollmentId(latest.getId());
        if (invoices.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy hóa đơn cho thông tin ghi danh");
        }

        Invoice invoice = invoices.get(invoices.size() - 1);
        if (invoice.getStatus() != InvoiceStatus.PAID) {
            paymentRepository.save(Payment.builder()
                    .invoice(invoice)
                    .amount(invoice.getFinalAmount())
                    .paymentDate(ZonedDateTime.now())
                    .paymentMethod(PaymentMethod.CASH)
                    .notes("Thu tiền mặt trực tiếp từ Quản lý Lead")
                    .build());
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
        }

        lead.setStatus(LeadStatus.PAID);
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse rejectLead(UUID leadId) {
        Lead lead = findLeadOrThrow(leadId);
        lead.setStatus(LeadStatus.NEW);
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional(readOnly = true)
    public Page<LeadResponse> getLeads(LeadStatus status,
                                       LeadSource source,
                                       LocalDate fromDate,
                                       LocalDate toDate,
                                       Pageable pageable) {
        ZonedDateTime from = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()) : null;
        ZonedDateTime to = toDate != null
                ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).minusNanos(1)
                : null;
        return leadRepository.findAll(buildLeadSpecification(status, source, from, to), normalizeLeadPageable(pageable))
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
    public LeadResponse updateLeadStatus(UUID id, UpdateLeadStatusRequest request) {
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Lead status is required");
        }
        Lead lead = findLeadOrThrow(id);
        lead.setStatus(request.getStatus());
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadConversionResponse convertLeadToStudent(UUID leadId) {
        Lead lead = findLeadOrThrow(leadId);
        if (lead.getStatus() != LeadStatus.PAID) {
            throw new IllegalArgumentException("Lead must pay before converting to student");
        }

        User user = findLinkedUser(lead)
                .orElseThrow(() -> new IllegalArgumentException("Linked user not found"));
        user.setRole(UserRole.STUDENT);
        userRepository.save(user);

        lead.setStatus(LeadStatus.CONVERTED);
        leadRepository.save(lead);

        return LeadConversionResponse.builder()
                .leadId(lead.getId())
                .leadStatus(lead.getStatus())
                .studentId(user.getId())
                .studentEmail(user.getEmail())
                .message("Lead converted to student successfully")
                .build();
    }

    private boolean hasInterestTarget(LeadInterestRequest request) {
        return request != null
                && (request.getClassId() != null || (request.getCourseIds() != null && !request.getCourseIds().isEmpty()));
    }

    private void saveCourseInterests(Lead lead, List<UUID> courseIds, String notes) {
        if (courseIds == null || courseIds.isEmpty()) {
            return;
        }

        Set<UUID> uniqueCourseIds = new LinkedHashSet<>(courseIds);
        uniqueCourseIds.remove(null);

        for (UUID courseId : uniqueCourseIds) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));
            LeadInterest interest = leadInterestRepository.findByLeadIdAndCourseId(lead.getId(), courseId)
                    .orElseGet(() -> LeadInterest.builder()
                            .lead(lead)
                            .course(course)
                            .status(LeadStatus.INTERESTED)
                            .build());

            interest.setStatus(LeadStatus.INTERESTED);
            interest.setNotes(firstNonBlank(notes, interest.getNotes()));
            leadInterestRepository.save(interest);
        }
    }

    private void saveClassInterest(Lead lead, UUID classId, String notes) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }

        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found with id: " + classId));
        LeadInterest interest = leadInterestRepository.findByLeadIdAndClazzId(lead.getId(), classId)
                .orElseGet(() -> LeadInterest.builder()
                        .lead(lead)
                        .clazz(clazz)
                        .status(LeadStatus.INTERESTED)
                        .build());

        interest.setStatus(LeadStatus.INTERESTED);
        interest.setNotes(firstNonBlank(notes, interest.getNotes()));
        leadInterestRepository.save(interest);
    }

    private Lead findLeadOrThrow(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + id));
    }

    private Lead findOrCreateLeadForUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Authenticated user is required");
        }

        Optional<Lead> existing = normalizeBlankToNull(user.getEmail()) != null
                ? leadRepository.findByEmailIgnoreCase(user.getEmail())
                : Optional.empty();
        if (existing.isEmpty() && normalizeBlankToNull(user.getPhone()) != null) {
            existing = leadRepository.findByPhone(user.getPhone());
        }

        return existing
                .map(lead -> syncLeadWithUser(lead, user))
                .orElseGet(() -> createLeadForUser(user));
    }

    private Lead syncLeadWithUser(Lead lead, User user) {
        boolean changed = false;
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

        return leadRepository.save(Lead.builder()
                .fullName(user.getFullName() != null ? user.getFullName() : user.getEmail())
                .email(normalizeBlankToNull(user.getEmail()))
                .phone(phone)
                .status(LeadStatus.NEW)
                .source(LeadSource.WEBSITE_FORM)
                .branchId(user.getBranchId())
                .build());
    }

    private void ensureLeadUserIfPossible(Lead lead, String password) {
        if (lead.getEmail() == null || lead.getEmail().isBlank()) {
            return;
        }
        userRepository.findByEmailIgnoreCase(lead.getEmail()).orElseGet(() -> {
            User user = new User();
            user.setEmail(lead.getEmail());
            user.setFullName(lead.getFullName());
            user.setPhone(lead.getPhone());
            user.setPassword(passwordEncoder.encode(firstNonBlank(password, lead.getPhone(), "123456")));
            user.setRole(UserRole.LEAD);
            user.setStatus(UserStatus.ACTIVE);
            user.setBranchId(lead.getBranchId());
            return userRepository.save(user);
        });
    }

    private User resolveOrCreateLeadUser(Lead lead) {
        return findLinkedUser(lead).orElseGet(() -> {
            ensureLeadUserIfPossible(lead, null);
            return findLinkedUser(lead)
                    .orElseThrow(() -> new IllegalArgumentException("Lead email is required to create a linked user"));
        });
    }

    private Optional<User> findLinkedUser(Lead lead) {
        String email = normalizeBlankToNull(lead.getEmail());
        if (email != null) {
            Optional<User> byEmail = userRepository.findByEmailIgnoreCase(email);
            if (byEmail.isPresent()) {
                return byEmail;
            }
        }

        String phone = normalizeBlankToNull(lead.getPhone());
        if (phone == null) {
            return Optional.empty();
        }
        return userRepository.findByPhone(phone).stream().findFirst();
    }

    private LeadResponse mapToResponse(Lead lead) {
        UUID userId = null;
        UUID enrollmentId = null;
        UUID invoiceId = null;
        Optional<User> linkedUser = findLinkedUser(lead);
        List<LeadInterestResponse> interests = leadInterestRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId()).stream()
                .map(this::mapInterestToResponse)
                .toList();

        if (linkedUser.isPresent()) {
            userId = linkedUser.get().getId();
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(userId);
            if (!enrollments.isEmpty()) {
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
                .userId(userId)
                .notes(lead.getNotes())
                .currentEnrollmentId(enrollmentId)
                .currentInvoiceId(invoiceId)
                .interests(interests)
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }

    private LeadInterestResponse mapInterestToResponse(LeadInterest interest) {
        Course course = interest.getCourse();
        Clazz clazz = interest.getClazz();
        Level level = clazz != null ? clazz.getLevel() : null;

        return LeadInterestResponse.builder()
                .id(interest.getId())
                .courseId(course != null ? course.getId() : null)
                .courseName(course != null ? course.getName() : null)
                .clazzId(clazz != null ? clazz.getId() : null)
                .clazzName(clazz != null ? clazz.getName() : null)
                .levelId(level != null ? level.getId() : null)
                .levelName(level != null ? level.getName() : null)
                .status(interest.getStatus())
                .notes(interest.getNotes())
                .createdAt(interest.getCreatedAt())
                .build();
    }

    private void applyLeadDetails(Lead lead, CreateLeadRequest request, String email, String phone) {
        lead.setFullName(firstNonBlank(request.getFullName(), lead.getFullName()));
        lead.setEmail(email != null ? email : lead.getEmail());
        lead.setPhone(phone != null ? phone : lead.getPhone());
        lead.setDateOfBirth(request.getDateOfBirth() != null ? request.getDateOfBirth() : lead.getDateOfBirth());
        lead.setGender(firstNonBlank(request.getGender(), lead.getGender()));
        lead.setAddress(firstNonBlank(request.getAddress(), lead.getAddress()));
        lead.setPreferredLevel(firstNonBlank(request.getPreferredLevel(), lead.getPreferredLevel()));
        lead.setAssessmentScore(request.getAssessmentScore() != null ? request.getAssessmentScore() : lead.getAssessmentScore());
        lead.setStatus(request.getStatus() != null ? request.getStatus() : lead.getStatus());
        lead.setSource(request.getSource() != null ? request.getSource() : lead.getSource());
        lead.setBranchId(request.getBranchId() != null ? request.getBranchId() : lead.getBranchId());
        lead.setNotes(firstNonBlank(request.getNotes(), lead.getNotes()));
    }

    private Optional<Lead> findExistingLead(String email, String phone) {
        if (email != null) {
            Optional<Lead> byEmail = leadRepository.findByEmailIgnoreCase(email);
            if (byEmail.isPresent()) {
                return byEmail;
            }
        }
        return phone != null && !phone.isBlank() ? leadRepository.findByPhone(phone) : Optional.empty();
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

    private String firstNonBlank(String... values) {
        for (String value : values) {
            String normalized = normalizeBlankToNull(value);
            if (normalized != null) {
                return normalized;
            }
        }
        return null;
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
