package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.lms.dto.ClassDto.ClassRequest;
import com.elc.system.modules.lms.dto.ClassDto.ClassResponse;
import com.elc.system.modules.lms.entity.ClassStatus;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.sms.dto.ClassScheduleDto.*;
import com.elc.system.modules.sms.entity.Branch;
import com.elc.system.modules.sms.entity.ClassSchedule;
import com.elc.system.modules.sms.entity.Course;
import com.elc.system.modules.sms.entity.Room;
import com.elc.system.modules.sms.repository.BranchRepository;
import com.elc.system.modules.sms.repository.ClassScheduleRepository;
import com.elc.system.modules.sms.repository.CourseRepository;
import com.elc.system.modules.sms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClazzService {

    private final ClazzRepository clazzRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ClassScheduleRepository classScheduleRepository;

    public List<ClassResponse> getAllClasses() {
        return clazzRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ClassResponse getClassById(UUID id) {
        return clazzRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    @Transactional
    public ClassResponse createClass(ClassRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

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
                .course(course)
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

    public List<ScheduleResponse> getClassSchedules(UUID classId) {
        return classScheduleRepository.findByClazzId(classId).stream()
                .map(this::mapToScheduleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ScheduleResponse addSchedule(UUID classId, ScheduleRequest request) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // Simple conflict check before adding
        ConflictCheckRequest conflictRequest = ConflictCheckRequest.builder()
                .teacherId(clazz.getTeacher() != null ? clazz.getTeacher().getId() : null)
                .roomId(clazz.getRoom() != null ? clazz.getRoom().getId() : null)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        
        ConflictCheckResponse conflict = checkConflict(conflictRequest);
        if (conflict.isHasConflict()) {
            throw new RuntimeException("Schedule conflict detected: " + conflict.getConflictMessage());
        }

        ClassSchedule schedule = ClassSchedule.builder()
                .clazz(clazz)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        return mapToScheduleResponse(classScheduleRepository.save(schedule));
    }

    public ConflictCheckResponse checkConflict(ConflictCheckRequest request) {
        // This is a simplified conflict check logic
        // In a real system, you would query existing schedules that overlap
        // For now, we'll return no conflict to keep it simple, but the structure is there
        return ConflictCheckResponse.builder()
                .hasConflict(false)
                .build();
    }

    private ClassResponse mapToResponse(Clazz clazz) {
        List<ScheduleResponse> schedules = classScheduleRepository.findByClazzId(clazz.getId()).stream()
                .map(this::mapToScheduleResponse)
                .collect(Collectors.toList());

        return ClassResponse.builder()
                .id(clazz.getId())
                .name(clazz.getName())
                .courseId(clazz.getCourse().getId())
                .courseName(clazz.getCourse().getName())
                .roomId(clazz.getRoom() != null ? clazz.getRoom().getId() : null)
                .roomName(clazz.getRoom() != null ? clazz.getRoom().getName() : null)
                .teacherId(clazz.getTeacher() != null ? clazz.getTeacher().getId() : null)
                .teacherName(clazz.getTeacher() != null ? clazz.getTeacher().getFullName() : null)
                .branchId(clazz.getBranch() != null ? clazz.getBranch().getId() : null)
                .branchName(clazz.getBranch() != null ? clazz.getBranch().getName() : null)
                .status(clazz.getStatus())
                .startDate(clazz.getStartDate())
                .endDate(clazz.getEndDate())
                .maxStudents(clazz.getMaxStudents())
                .schedules(schedules)
                .build();
    }

    private ScheduleResponse mapToScheduleResponse(ClassSchedule schedule) {
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .classId(schedule.getClazz().getId())
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .build();
    }
}
