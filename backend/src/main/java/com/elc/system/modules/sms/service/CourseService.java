package com.elc.system.modules.sms.service;

import com.elc.system.modules.sms.dto.CourseDto.CourseRequest;
import com.elc.system.modules.sms.dto.CourseDto.CourseLevelSummary;
import com.elc.system.modules.sms.dto.CourseDto.CourseResponse;
import com.elc.system.modules.sms.entity.Course;
import com.elc.system.modules.sms.entity.Level;
import com.elc.system.modules.sms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(UUID id) {
        return courseRepository.findWithLevelsById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        Course course = Course.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return mapToResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse updateCourse(UUID id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setName(request.getName());
        course.setDescription(request.getDescription());
        return mapToResponse(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(UUID id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found");
        }
        courseRepository.deleteById(id);
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .description(course.getDescription())
                .levels(mapLevels(course.getLevels()))
                .build();
    }

    private List<CourseLevelSummary> mapLevels(List<Level> levels) {
        if (levels == null) {
            return List.of();
        }

        return levels.stream()
                .map(level -> CourseLevelSummary.builder()
                        .id(level.getId())
                        .code(level.getCode())
                        .name(level.getName())
                        .basePrice(level.getBasePrice())
                        .durationWeeks(level.getDurationWeeks())
                        .build())
                .collect(Collectors.toList());
    }
}
