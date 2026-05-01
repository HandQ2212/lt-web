# Class State Lifecycle Management Research

## Overview

Research conducted on best practices for implementing class state lifecycle management in Spring Boot applications. Based on analysis of existing codebase and comprehensive industry research.

## Current Codebase Analysis

### Existing State Management
- **Class Status Enum**: `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`
- **Enrollment Status Enum**: `PENDING`, `ACTIVE`, `COMPLETED`, `DROPPED`, `CANCELLED`
- **Base Entity**: Implements standard audit fields (createdAt, updatedAt)
- **Service Layer**: Basic business logic validation
- **Controller Layer**: REST endpoints for CRUD operations

## Research Findings

### 1. State Transition Patterns

**Best Practices for JPA Entity State Transitions:**

#### Enum-Based State Management
```java
@Entity
public class Clazz extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ClassStatus status = ClassStatus.UPCOMING;

    // Business validation in service layer
    public void transitionTo(ClassStatus newStatus) {
        validateTransition(newStatus);
        this.status = newStatus;
    }

    private void validateTransition(ClassStatus newStatus) {
        switch (this.status) {
            case UPCOMING:
                if (newStatus != ClassStatus.ONGOING && newStatus != ClassStatus.CANCELLED) {
                    throw new InvalidStateException("Cannot transition from UPCOMING to " + newStatus);
                }
                break;
            case ONGOING:
                if (newStatus != ClassStatus.COMPLETED && newStatus != ClassStatus.CANCELLED) {
                    throw new InvalidStateException("Cannot transition from ONGOING to " + newStatus);
                }
                break;
            case COMPLETED:
                throw new InvalidStateException("Cannot change status from COMPLETED");
            case CANCELLED:
                throw new InvalidStateException("Cannot change status from CANCELLED");
        }
    }
}
```

#### Spring State Machine Integration
For complex state management, consider Spring State Machine:

```java
@Configuration
@EnableStateMachine
public class ClassStateMachineConfig {

    @Bean
    public StateMachineConfigurer<States, Events> config() {
        return builder
            .configureStates()
                .initial(States.UPCOMING)
                .state(States.ONGOING)
                .state(States.COMPLETED)
                .state(States.CANCELLED)
            .and()
            .configureTransitions()
                .withExternal()
                    .source(States.UPCOMING).target(States.ONGOING)
                    .event(Events.START_CLASS)
                    .guard(() -> validateStartConditions())
                .withExternal()
                    .source(States.ONGOING).target(States.COMPLETED)
                    .event(Events.COMPLETE_CLASS)
                    .guard(() -> validateCompletionConditions())
                .withExternal()
                    .source(States.UPCOMING).target(States.CANCELLED)
                    .event(Events.CANCEL_CLASS)
                    .guard(() -> validateCancellationConditions());
    }
}
```

#### Validation Strategies
- **JPA Lifecycle Events**: Use `@PrePersist`, `@PreUpdate` for basic validation
- **Service Layer Validation**: Complex business rules in service methods
- **Custom Annotations**: Create domain-specific validation annotations
- **State Guards**: Implement transition validation as guard conditions

### 2. REST API Design for State Transitions

#### PUT vs PATCH Usage

**PATCH for Status Updates** (Recommended):
```java
@RestController
@RequestMapping("/api/classes")
public class ClazzController {

    @PatchMapping("/{id}/status")
    public ResponseEntity<ClassResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request) {
        // Partial update - only status field changes
        ClassResponse updated = clazzService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    // Or use action-based endpoints
    @PostMapping("/{id}/start")
    public ResponseEntity<ClassResponse> startClass(@PathVariable UUID id) {
        ClassResponse updated = clazzService.startClass(id);
        return ResponseEntity.ok(updated);
    }
}
```

**PUT for Complete Resource Replacement**:
```java
@PutMapping("/{id}")
public ResponseEntity<ClassResponse> updateClass(
        @PathVariable UUID id,
        @Valid @RequestBody ClassUpdateRequest request) {
    // Complete resource replacement
    ClassResponse updated = clazzService.updateClass(id, request);
    return ResponseEntity.ok(updated);
}
```

#### HATEOAS and Hypermedia Controls
```java
public ClassResponse mapToResponse(Clazz clazz) {
    ClassResponse.ClassResponseBuilder builder = ClassResponse.builder()
        .id(clazz.getId())
        .status(clazz.getStatus());

    // Add hypermedia controls
    List<Link> links = new ArrayList<>();
    links.add(Link.of("/api/classes/" + clazz.getId(), "self"));

    // Add available transitions
    switch (clazz.getStatus()) {
        case UPCOMING:
            links.add(Link.of("/api/classes/" + clazz.getId() + "/start", "start"));
            links.add(Link.of("/api/classes/" + clazz.getId() + "/cancel", "cancel"));
            break;
        case ONGOING:
            links.add(Link.of("/api/classes/" + clazz.getId() + "/complete", "complete"));
            links.add(Link.of("/api/classes/" + clazz.getId() + "/cancel", "cancel"));
            break;
        // No transitions for completed/cancelled
    }

    return builder.links(links).build();
}
```

#### Best Practices Summary
- **Use PATCH** for partial updates and status changes
- **Use PUT** for complete resource replacement
- **Use POST** for actions that don't fit traditional CRUD (e.g., start class)
- **Provide clear error messages** for invalid transitions
- **Include current state** in all responses

### 3. Delete Validation Patterns

#### Soft Delete vs Hard Delete

**Soft Delete Implementation**:
```java
@Entity
@SQLDelete(sql = "UPDATE classes SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Clazz extends BaseEntity {

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void softDelete() {
        // Check dependent records
        if (hasEnrollments()) {
            throw new IllegalStateException("Cannot delete class with active enrollments");
        }
        if (hasAssignments()) {
            throw new IllegalStateException("Cannot delete class with assignments");
        }

        this.deletedAt = LocalDateTime.now();
    }
}
```

**Custom Delete Validation**:
```java
@Service
public class ClazzService {

    @Transactional
    public void deleteClass(UUID classId) {
        Clazz clazz = clazzRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        // Business validation before deletion
        validateDelete(clazz);

        // Use custom repository method for soft delete
        clazzRepository.softDelete(classId);
    }

    private void validateDelete(Clazz clazz) {
        // Check for active enrollments
        long activeEnrollments = enrollmentRepository.countByClassIdAndStatusNot(
            clazz.getId(), EnrollmentStatus.DROPPED, EnrollmentStatus.CANCELLED);

        if (activeEnrollments > 0) {
            throw new IllegalStateException("Cannot delete class with active enrollments");
        }

        // Check for future schedules
        List<ClassSchedule> futureSchedules = classScheduleRepository
            .findByClassIdAndDateAfter(clazz.getId(), LocalDate.now());

        if (!futureSchedules.isEmpty()) {
            throw new IllegalStateException("Cannot delete class with future schedules");
        }
    }
}
```

#### @OnDelete vs Custom Validation
- **@OnDelete**: Best for simple cascade delete relationships
- **Custom Validation**: Better for complex business rules dependent records
- **Mixed Approach**: Use both for different types of relationships

### 4. Enrollment Validation Patterns

#### Business Logic and Capacity Checking

**Enhanced Enrollment Service**:
```java
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ClazzRepository clazzRepository;
    private final UserRepository userRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public EnrollmentResponse enrollStudent(EnrollmentRequest request) {
        // 1. Validate class exists and is enrollable
        Clazz clazz = validateClassForEnrollment(request.getClassId());

        // 2. Validate student exists
        User student = validateStudent(request.getStudentId());

        // 3. Check capacity with pessimistic locking
        validateCapacity(clazz.getId());

        // 4. Check for existing enrollment
        checkExistingEnrollment(request.getStudentId(), request.getClassId());

        // 5. Check prerequisites (if applicable)
        validatePrerequisites(student, clazz);

        // 6. Check time conflicts
        validateTimeConflicts(student, clazz);

        // 7. Create enrollment
        Enrollment enrollment = createEnrollment(student, clazz, request);

        return mapToResponse(enrollmentRepository.save(enrollment));
    }

    private Clazz validateClassForEnrollment(UUID classId) {
        Clazz clazz = clazzRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        if (clazz.getStatus() != ClassStatus.UPCOMING) {
            throw new IllegalStateException("Cannot enroll in class that is not UPCOMING");
        }

        if (clazz.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Class start date has passed");
        }

        return clazz;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    private void validateCapacity(UUID classId) {
        Clazz clazz = clazzRepository.findByIdForUpdate(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        long currentEnrolled = enrollmentRepository.countByClassIdAndStatus(
            classId, EnrollmentStatus.ACTIVE, EnrollmentStatus.PENDING);

        if (currentEnrolled >= clazz.getMaxStudents()) {
            throw new IllegalStateException("Class capacity exceeded");
        }
    }
}
```

#### Custom Validation Annotations
```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ClassCapacityValidator.class)
public @interface ClassCapacityAvailable {
    String message() default "Class capacity exceeded";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class ClassCapacityValidator implements ConstraintValidator<ClassCapacityAvailable, UUID> {

    @Override
    public boolean isValid(UUID classId, ConstraintValidatorContext context) {
        if (classId == null) {
            return true;
        }

        Clazz clazz = clazzRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        long currentEnrolled = enrollmentRepository.countByClassIdAndStatus(
            classId, EnrollmentStatus.ACTIVE, EnrollmentStatus.PENDING);

        return currentEnrolled < clazz.getMaxStudents();
    }
}
```

#### Transaction Management Best Practices
- **Isolation Levels**: Use `READ_COMMITTED` for capacity checks to prevent race conditions
- **Pessimistic Locking**: Lock records during critical operations like enrollment
- **Rollback Behavior**: Define rollback for specific business exceptions
- **Atomic Operations**: Ensure enrollment creation and capacity updates are atomic

## Implementation Recommendations

### Short-term Improvements
1. **Add status transition validation** to existing service layer
2. **Implement capacity checking** with proper transaction management
3. **Add soft delete** with dependent record validation
4. **Enhance error handling** for state transitions

### Medium-term Enhancements
1. **Implement Spring State Machine** for complex state management
2. **Add HATEOAS controls** to API responses
3. **Create custom validation annotations** for domain-specific rules
4. **Add comprehensive audit logging** for state changes

### Long-term Architecture
1. **Consider event-driven architecture** for state changes
2. **Implement CQRS pattern** for read/write separation
3. **Add caching** for frequently accessed class state data
4. **Implement distributed transactions** for microservices architecture

## Code Examples Summary

### State Transition Validation
- Use enums with `@Enumerated(EnumType.STRING)`
- Implement transition validation in service layer
- Consider Spring State Machine for complex scenarios

### REST API Design
- Use PATCH for status updates, PUT for complete replacement
- Add hypermedia controls for discoverable APIs
- Provide clear error messages for invalid transitions

### Delete Validation
- Implement soft delete with `@SQLDelete` and `@Where`
- Use custom validation for business rules
- Check dependent records before deletion

### Enrollment Management
- Use `@Transactional` with proper isolation levels
- Implement pessimistic locking for capacity checks
- Create custom validation annotations for business rules

## Sources
- [State Management in Spring Boot — Simplified!](https://medium.com/@omkarterbhai/state-management-in-spring-boot-simplified-8ca8de31f1e8)
- [Spring State Machine to manage JPA entity](https://stackoverflow.com/questions/53823943/spring-state-machine-to-manage-jpa-entity)
- [REST API Design Best Practices](https://github.com/interagent/http-api-design/issues/58)
- [Soft Delete in Spring Boot JPA](https://medium.com/@samrat.alam/soft-delete-in-spring-boot-jpa-best-practices-real-world-implementation-2d831e60bb3e)
- [Spring Boot Validation Guide](https://dev.to/gianfcop98/spring-boot-and-validation-a-complete-guide-with-valid-and-validated-471p)

## Unresolved Questions
1. Should we implement Spring State Machine now or wait for more complex state requirements?
2. What level of HATEOAS implementation is appropriate for this project's maturity?
3. How should we handle historical data when states change (audit requirements)?
4. What are the performance implications of pessimistic locking for high-volume enrollment?