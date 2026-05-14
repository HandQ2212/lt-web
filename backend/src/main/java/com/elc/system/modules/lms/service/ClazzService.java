package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.lms.dto.ClassDto.ClassRequest;
import com.elc.system.modules.lms.dto.ClassDto.ClassResponse;
import com.elc.system.modules.lms.entity.ClassStatus;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.entity.EnrollmentStatus;
import com.elc.system.modules.lms.exception.ClassDeletionException;
import com.elc.system.modules.lms.exception.InvalidClassStatusException;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import com.elc.system.modules.sms.dto.ClassScheduleDto.*;
import com.elc.system.modules.sms.entity.Branch;
import com.elc.system.modules.sms.entity.ClassSchedule;
import com.elc.system.modules.sms.entity.Course;
import com.elc.system.modules.sms.entity.Level;
import com.elc.system.modules.room.entity.Room;
import com.elc.system.modules.sms.repository.BranchRepository;
import com.elc.system.modules.sms.repository.ClassScheduleRepository;
import com.elc.system.modules.sms.repository.LevelRepository;
import com.elc.system.modules.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClazzService {

    private final ClazzRepository clazzRepository;
    private final LevelRepository levelRepository;
    private final RoomRepository roomRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public List<ClassResponse> getAllClasses() {
        return clazzRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClassResponse getClassById(UUID id) {
        return clazzRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    @Transactional
    public ClassResponse createClass(ClassRequest request) {
        if (request.getLevelId() == null) {
            throw new IllegalArgumentException("Level id is required");
        }
        Level level = levelRepository.findById(request.getLevelId())
                .orElseThrow(() -> new RuntimeException("Level not found"));

        Room room = null;
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        }

        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
        }

        User teacher = null;
        if (request.getTeacherId() != null) {
            teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
        }

        Clazz clazz = Clazz.builder()
                .level(level)
                .room(room)
                .teacher(teacher)
                .branch(branch)
                .name(request.getName())
                .status(request.getStatus() != null ? request.getStatus() : ClassStatus.UPCOMING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 20)
                .build();

        return mapToResponse(clazzRepository.save(clazz));
    }

    @Transactional
    public ClassResponse updateClass(UUID id, ClassRequest request) {
        Clazz existingClass = clazzRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // Update fields if provided
        if (request.getLevelId() != null) {
            Level level = levelRepository.findById(request.getLevelId())
                    .orElseThrow(() -> new RuntimeException("Level not found"));
            existingClass.setLevel(level);
        }

        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            existingClass.setRoom(room);
        }

        if (request.getTeacherId() != null) {
            User teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            existingClass.setTeacher(teacher);
        }

        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
            existingClass.setBranch(branch);
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            existingClass.setName(request.getName());
        }

        if (request.getStatus() != null) {
            validateStatusTransition(existingClass.getStatus(), request.getStatus());
            existingClass.setStatus(request.getStatus());
        }

        if (request.getStartDate() != null) {
            existingClass.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            existingClass.setEndDate(request.getEndDate());
        }

        if (request.getMaxStudents() != null) {
            // Validate new capacity doesn't conflict with current enrollments
            long currentEnrollments = enrollmentRepository.findByClazzId(id).stream()
                    .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE || e.getStatus() == EnrollmentStatus.PENDING)
                    .count();

            if (request.getMaxStudents() < currentEnrollments) {
                throw new IllegalArgumentException("Cannot reduce max students below current enrollment count");
            }
            existingClass.setMaxStudents(request.getMaxStudents());
        }

        return mapToResponse(clazzRepository.save(existingClass));
    }

    @Transactional
    public void deleteClass(UUID id) {
        Clazz clazz = clazzRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // Check for active enrollments
        long activeEnrollments = enrollmentRepository.findByClazzId(id).stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE || e.getStatus() == EnrollmentStatus.PENDING)
                .count();

        if (activeEnrollments > 0) {
            throw new ClassDeletionException("Cannot delete class with active enrollments. Current active enrollments: " + activeEnrollments);
        }

        // Check if class has already started
        if (clazz.getStartDate() != null && clazz.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new ClassDeletionException("Cannot delete class that has already started");
        }

        clazzRepository.delete(clazz);
    }

    @Transactional
    public ClassResponse updateClassStatus(UUID id, ClassStatus newStatus) {
        Clazz clazz = clazzRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        validateStatusTransition(clazz.getStatus(), newStatus);
        clazz.setStatus(newStatus);

        return mapToResponse(clazzRepository.save(clazz));
    }

    private void validateStatusTransition(ClassStatus currentStatus, ClassStatus newStatus) {
        if (currentStatus == newStatus) {
            return; // No change needed
        }

        switch (currentStatus) {
            case UPCOMING:
                if (newStatus != ClassStatus.ACCEPTING && newStatus != ClassStatus.CANCELLED) {
                    throw new InvalidClassStatusException(
                            "Invalid status transition from " + currentStatus + " to " + newStatus +
                                    ". Allowed transitions: UPCOMING → ACCEPTING, UPCOMING → CANCELLED");
                }
                break;

            case ACCEPTING:
                if (newStatus != ClassStatus.ONGOING && newStatus != ClassStatus.CANCELLED) {
                    throw new InvalidClassStatusException(
                            "Invalid status transition from " + currentStatus + " to " + newStatus +
                                    ". Allowed transitions: ACCEPTING → ONGOING, ACCEPTING → CANCELLED");
                }
                break;

            case ONGOING:
                if (newStatus != ClassStatus.COMPLETED && newStatus != ClassStatus.CANCELLED) {
                    throw new InvalidClassStatusException(
                            "Invalid status transition from " + currentStatus + " to " + newStatus +
                                    ". Allowed transitions: ONGOING → COMPLETED, ONGOING → CANCELLED");
                }
                break;

            case COMPLETED:
                throw new InvalidClassStatusException(
                        "Cannot change status from COMPLETED. Class is already finalized.");

            case CANCELLED:
                throw new InvalidClassStatusException(
                        "Cannot change status from CANCELLED. Class is already cancelled.");

            default:
                throw new InvalidClassStatusException("Unknown current status: " + currentStatus);
        }
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getClassSchedules(UUID classId) {
        return classScheduleRepository.findByClazzId(classId).stream()
                .map(this::mapToScheduleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ScheduleResponse addSchedule(UUID classId, ScheduleRequest request) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        LocalDate scheduleDate = request.getScheduleDate();
        String dayOfWeek = resolveDayOfWeek(scheduleDate, request.getDayOfWeek());

        // Validate that start time is before end time
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be strictly before end time. Start: " + request.getStartTime() + ", End: " + request.getEndTime());
        }

        // Conflict check before adding
        ConflictCheckRequest conflictRequest = ConflictCheckRequest.builder()
                .teacherId(clazz.getTeacher() != null ? clazz.getTeacher().getId() : null)
                .roomId(clazz.getRoom() != null ? clazz.getRoom().getId() : null)
                .scheduleDate(scheduleDate)
                .dayOfWeek(dayOfWeek)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        
        ConflictCheckResponse conflict = checkConflict(conflictRequest);
        if (conflict.isHasConflict()) {
            throw new RuntimeException("Schedule conflict detected: " + conflict.getConflictMessage());
        }

        ClassSchedule schedule = ClassSchedule.builder()
                .clazz(clazz)
                .dayOfWeek(dayOfWeek)
                .scheduleDate(scheduleDate)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        return mapToScheduleResponse(classScheduleRepository.save(schedule));
    }

    @Transactional
    public ScheduleResponse updateSchedule(UUID classId, UUID scheduleId, ScheduleRequest request) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        ClassSchedule schedule = classScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        if (schedule.getClazz() == null || !schedule.getClazz().getId().equals(clazz.getId())) {
            throw new IllegalArgumentException("Schedule does not belong to the given class");
        }
        LocalDate scheduleDate = request.getScheduleDate();
        String dayOfWeek = resolveDayOfWeek(scheduleDate, request.getDayOfWeek());

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be strictly before end time. Start: " + request.getStartTime() + ", End: " + request.getEndTime());
        }

        ConflictCheckResponse conflict = checkConflictExcludingSchedule(scheduleId, ConflictCheckRequest.builder()
                .teacherId(clazz.getTeacher() != null ? clazz.getTeacher().getId() : null)
                .roomId(clazz.getRoom() != null ? clazz.getRoom().getId() : null)
                .scheduleDate(scheduleDate)
                .dayOfWeek(dayOfWeek)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build());

        if (conflict.isHasConflict()) {
            throw new RuntimeException("Schedule conflict detected: " + conflict.getConflictMessage());
        }

        schedule.setDayOfWeek(dayOfWeek);
        schedule.setScheduleDate(scheduleDate);
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());

        return mapToScheduleResponse(classScheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(UUID classId, UUID scheduleId) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        ClassSchedule schedule = classScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        if (schedule.getClazz() == null || !schedule.getClazz().getId().equals(clazz.getId())) {
            throw new IllegalArgumentException("Schedule does not belong to the given class");
        }

        classScheduleRepository.delete(schedule);
    }

    @Transactional(readOnly = true)
    public ConflictCheckResponse checkConflict(ConflictCheckRequest request) {
        // Validate that start time is before end time
        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
                return ConflictCheckResponse.builder()
                        .hasConflict(true)
                        .conflictMessage("Start time must be strictly before end time")
                        .build();
            }
        }

        // Check for overlapping schedules with the same teacher or room
        List<ClassSchedule> existingSchedules = classScheduleRepository.findAll();
        
        for (ClassSchedule existing : existingSchedules) {
            if (!isSameScheduleDay(existing, request)) {
                continue;
            }

            // Check for teacher conflict
            if (request.getTeacherId() != null && existing.getClazz() != null && existing.getClazz().getTeacher() != null) {
                if (existing.getClazz().getTeacher().getId().equals(request.getTeacherId())) {
                    if (isTimeOverlap(existing.getStartTime(), existing.getEndTime(), 
                                     request.getStartTime(), request.getEndTime())) {
                        return ConflictCheckResponse.builder()
                                .hasConflict(true)
                                .conflictMessage("Teacher already has a class scheduled at this time")
                                .build();
                    }
                }
            }

            // Check for room conflict
            if (request.getRoomId() != null && existing.getClazz() != null && existing.getClazz().getRoom() != null) {
                if (existing.getClazz().getRoom().getId().equals(request.getRoomId())) {
                    if (isTimeOverlap(existing.getStartTime(), existing.getEndTime(), 
                                     request.getStartTime(), request.getEndTime())) {
                        return ConflictCheckResponse.builder()
                                .hasConflict(true)
                                .conflictMessage("Room already has a class scheduled at this time")
                                .build();
                    }
                }
            }
        }

        return ConflictCheckResponse.builder()
                .hasConflict(false)
                .build();
    }

    @Transactional(readOnly = true)
    public ConflictCheckResponse checkConflictExcludingSchedule(UUID excludedScheduleId, ConflictCheckRequest request) {
        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
                return ConflictCheckResponse.builder()
                        .hasConflict(true)
                        .conflictMessage("Start time must be strictly before end time")
                        .build();
            }
        }

        List<ClassSchedule> existingSchedules = classScheduleRepository.findAll();

        for (ClassSchedule existing : existingSchedules) {
            if (excludedScheduleId != null && excludedScheduleId.equals(existing.getId())) {
                continue;
            }

            if (!isSameScheduleDay(existing, request)) {
                continue;
            }

            if (request.getTeacherId() != null && existing.getClazz() != null && existing.getClazz().getTeacher() != null) {
                if (existing.getClazz().getTeacher().getId().equals(request.getTeacherId())) {
                    if (isTimeOverlap(existing.getStartTime(), existing.getEndTime(), request.getStartTime(), request.getEndTime())) {
                        return ConflictCheckResponse.builder()
                                .hasConflict(true)
                                .conflictMessage("Teacher already has a class scheduled at this time")
                                .build();
                    }
                }
            }

            if (request.getRoomId() != null && existing.getClazz() != null && existing.getClazz().getRoom() != null) {
                if (existing.getClazz().getRoom().getId().equals(request.getRoomId())) {
                    if (isTimeOverlap(existing.getStartTime(), existing.getEndTime(), request.getStartTime(), request.getEndTime())) {
                        return ConflictCheckResponse.builder()
                                .hasConflict(true)
                                .conflictMessage("Room already has a class scheduled at this time")
                                .build();
                    }
                }
            }
        }

        return ConflictCheckResponse.builder()
                .hasConflict(false)
                .build();
    }

    /**
     * Check if two time periods overlap
     * Times overlap if: start1 < end2 AND start2 < end1
     */
    private boolean isTimeOverlap(java.time.LocalTime start1, java.time.LocalTime end1, 
                                  java.time.LocalTime start2, java.time.LocalTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    private String resolveDayOfWeek(LocalDate scheduleDate, String dayOfWeek) {
        if (scheduleDate != null) {
            return scheduleDate.getDayOfWeek().name();
        }

        if (dayOfWeek == null || dayOfWeek.isBlank()) {
            throw new IllegalArgumentException("Schedule date is required");
        }

        return dayOfWeek.trim().toUpperCase();
    }

    private boolean isSameScheduleDay(ClassSchedule existing, ConflictCheckRequest request) {
        if (existing.getScheduleDate() != null && request.getScheduleDate() != null) {
            return existing.getScheduleDate().equals(request.getScheduleDate());
        }

        if (existing.getScheduleDate() != null || request.getScheduleDate() != null) {
            return false;
        }

        return existing.getDayOfWeek() != null
                && request.getDayOfWeek() != null
                && existing.getDayOfWeek().equalsIgnoreCase(request.getDayOfWeek());
    }

    private ClassResponse mapToResponse(Clazz clazz) {
        List<ScheduleResponse> schedules = classScheduleRepository.findByClazzId(clazz.getId()).stream()
                .map(this::mapToScheduleResponse)
                .collect(Collectors.toList());

        Level level = null;
        Course course = null;
        Room room = null;
        User teacher = null;
        Branch branch = null;

        try {
            level = clazz.getLevel();
            course = level != null ? level.getCourse() : null;
        } catch (RuntimeException ignored) {
            // Keep the class visible even if imported data points to a missing level.
        }

        try {
            room = clazz.getRoom();
        } catch (RuntimeException ignored) {
            // Optional relation.
        }

        try {
            teacher = clazz.getTeacher();
        } catch (RuntimeException ignored) {
            // Optional relation.
        }

        try {
            branch = clazz.getBranch();
        } catch (RuntimeException ignored) {
            // Optional relation.
        }

        return ClassResponse.builder()
                .id(clazz.getId())
                .name(clazz.getName())
                .levelId(level != null ? safeId(level::getId) : null)
                .levelName(level != null ? safeString(level::getName) : null)
                .courseId(course != null ? safeId(course::getId) : null)
                .courseName(course != null ? safeString(course::getName) : null)
                .basePrice(level != null ? level.getBasePrice() : null)
                .roomId(room != null ? safeId(room::getId) : null)
                .roomName(room != null ? safeString(room::getName) : null)
                .teacherId(teacher != null ? safeId(teacher::getId) : null)
                .teacherName(teacher != null ? safeString(teacher::getFullName) : null)
                .branchId(branch != null ? safeId(branch::getId) : null)
                .branchName(branch != null ? safeString(branch::getName) : null)
                .status(clazz.getStatus())
                .startDate(clazz.getStartDate())
                .endDate(clazz.getEndDate())
                .maxStudents(clazz.getMaxStudents())
                .currentStudents(clazz.getCurrentStudents())
                .schedules(schedules)
                .build();
    }

    private ScheduleResponse mapToScheduleResponse(ClassSchedule schedule) {
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .classId(safeId(() -> schedule.getClazz() != null ? schedule.getClazz().getId() : null))
                .dayOfWeek(schedule.getDayOfWeek())
                .scheduleDate(schedule.getScheduleDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .build();
    }

    private UUID safeId(SupplierWithRuntimeException<UUID> supplier) {
        try {
            return supplier.get();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private String safeString(SupplierWithRuntimeException<String> supplier) {
        try {
            return supplier.get();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    @FunctionalInterface
    private interface SupplierWithRuntimeException<T> {
        T get();
    }
}
