package com.elc.system.modules.school.course.service;

import com.elc.system.modules.school.course.dto.CourseDto.CourseResponse;
import com.elc.system.modules.school.course.dto.CourseDto.CreateCourseRequest;
import com.elc.system.modules.school.course.dto.CourseDto.UpdateCourseRequest;
import com.elc.system.modules.school.course.entity.Course;
import com.elc.system.modules.school.course.entity.CourseStatus;
import com.elc.system.modules.school.course.entity.Level;
import com.elc.system.modules.school.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final LevelService levelService;

    public Page<CourseResponse> getCourses(CourseStatus status, UUID levelId, String keyword, Pageable pageable) {
        return courseRepository.search(status, levelId, keyword, pageable)
                .map(this::mapToResponse);
    }

    public CourseResponse getCourseById(UUID id) {
        return mapToResponse(findCourseById(id));
    }

    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        Level level = levelService.findLevelById(request.getLevelId());

        Course course = Course.builder()
                .name(request.getName())
                .description(request.getDescription())
                .level(level)
                .durationWeeks(request.getDurationWeeks())
                .basePrice(request.getBasePrice())
                .maxStudents(request.getMaxStudents())
                .curriculumUrl(request.getCurriculumUrl())
                .status(request.getStatus())
                .build();

        return mapToResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse updateCourse(UUID id, UpdateCourseRequest request) {
        Course course = findCourseById(id);
        Level level = levelService.findLevelById(request.getLevelId());

        course.setName(request.getName());
        course.setDescription(request.getDescription());
        course.setLevel(level);
        course.setDurationWeeks(request.getDurationWeeks());
        course.setBasePrice(request.getBasePrice());
        course.setMaxStudents(request.getMaxStudents());
        course.setCurriculumUrl(request.getCurriculumUrl());
        course.setStatus(request.getStatus());

        return mapToResponse(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(UUID id) {
        Course course = findCourseById(id);
        courseRepository.delete(course);
    }

    private Course findCourseById(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));
    }

    private CourseResponse mapToResponse(Course course) {
        Level level = course.getLevel();

        return CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .description(course.getDescription())
                .levelId(level != null ? level.getId() : null)
                .levelCode(level != null ? level.getCode() : null)
                .levelName(level != null ? level.getName() : null)
                .durationWeeks(course.getDurationWeeks())
                .basePrice(course.getBasePrice())
                .maxStudents(course.getMaxStudents())
                .curriculumUrl(course.getCurriculumUrl())
                .status(course.getStatus())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
