package com.elc.system.modules.sms.service;

import com.elc.system.modules.sms.dto.CourseDto.CourseRequest;
import com.elc.system.modules.sms.dto.CourseDto.CourseResponse;
import com.elc.system.modules.sms.entity.Course;
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

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(UUID id) {
        return courseRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        Course course = Course.builder()
                .name(request.getName())
                .description(request.getDescription())
                .level(request.getLevel())
                .basePrice(request.getBasePrice())
                .build();

        return mapToResponse(courseRepository.save(course));
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .description(course.getDescription())
                .level(course.getLevel())
                .basePrice(course.getBasePrice())
                .build();
    }
}
