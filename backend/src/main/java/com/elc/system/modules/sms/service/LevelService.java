package com.elc.system.modules.sms.service;

import com.elc.system.modules.sms.dto.LevelDto.LevelRequest;
import com.elc.system.modules.sms.dto.LevelDto.LevelResponse;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.sms.entity.Course;
import com.elc.system.modules.sms.entity.Level;
import com.elc.system.modules.sms.repository.CourseRepository;
import com.elc.system.modules.sms.repository.LevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LevelService {

    private final LevelRepository levelRepository;
    private final CourseRepository courseRepository;
    private final ClazzRepository clazzRepository;

    @Transactional(readOnly = true)
    public List<LevelResponse> getAllLevels() {
        return levelRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LevelResponse getLevelById(UUID id) {
        return levelRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Level not found"));
    }

    @Transactional
    public LevelResponse createLevel(LevelRequest request) {
        if (request.getCourseId() == null) {
            throw new IllegalArgumentException("Course id is required");
        }
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        String normalizedCode = resolveCode(course, request.getCode(), request.getName(), null);
        if (levelRepository.existsByCourseIdAndCodeIgnoreCase(course.getId(), normalizedCode)) {
            throw new IllegalArgumentException("Level code already exists for this course");
        }

        Level level = Level.builder()
                .course(course)
                .code(normalizedCode)
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder())
                .basePrice(request.getBasePrice() == null ? java.math.BigDecimal.ZERO : request.getBasePrice())
                .durationWeeks(request.getDurationWeeks() == null ? 12 : request.getDurationWeeks())
                .isActive(request.getIsActive() == null || request.getIsActive())
                .build();

        return mapToResponse(levelRepository.save(level));
    }

    @Transactional
    public LevelResponse updateLevel(UUID id, LevelRequest request) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Level not found"));

        Course course = request.getCourseId() == null
                ? level.getCourse()
                : courseRepository.findById(request.getCourseId())
                        .orElseThrow(() -> new RuntimeException("Course not found"));
        String normalizedCode = resolveCode(course, request.getCode(), request.getName(), level.getCode());
        if (levelRepository.existsByCourseIdAndCodeIgnoreCaseAndIdNot(course.getId(), normalizedCode, id)) {
            throw new IllegalArgumentException("Level code already exists for this course");
        }

        level.setCourse(course);
        level.setCode(normalizedCode);
        level.setName(request.getName());
        level.setDescription(request.getDescription());
        level.setDisplayOrder(request.getDisplayOrder());
        level.setBasePrice(request.getBasePrice() == null ? java.math.BigDecimal.ZERO : request.getBasePrice());
        level.setDurationWeeks(request.getDurationWeeks() == null ? 12 : request.getDurationWeeks());
        level.setIsActive(request.getIsActive() == null || request.getIsActive());

        return mapToResponse(levelRepository.save(level));
    }

    @Transactional
    public void deleteLevel(UUID id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Level not found"));

        if (clazzRepository.existsByLevelId(id)) {
            throw new IllegalArgumentException("Level is already used by classes");
        }

        levelRepository.delete(level);
    }

    private String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    private String resolveCode(Course course, String code, String name, String fallbackCode) {
        // If code provided (not null), use it after normalization
        if (code != null && !code.isBlank()) {
            return normalizeCode(code);
        }
        // Otherwise try slugify name
        String slugifiedName = slugify(name);
        if (slugifiedName != null && !slugifiedName.isBlank()) {
            return slugifiedName;
        }
        // Use fallback if provided
        if (fallbackCode != null && !fallbackCode.isBlank()) {
            return normalizeCode(fallbackCode);
        }
        // Last resort: use course name
        return course.getName() == null ? "LEVEL" : slugify(course.getName()) + "_LEVEL";
    }

    private String slugify(String value) {
        if (value == null) {
            return null;
        }
        String normalized = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^\\p{Alnum}]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_+|_+$", "");
        return normalized.toUpperCase(Locale.ROOT);
    }

    private LevelResponse mapToResponse(Level level) {
        return LevelResponse.builder()
                .id(level.getId())
                .courseId(level.getCourse() != null ? level.getCourse().getId() : null)
                .courseName(level.getCourse() != null ? level.getCourse().getName() : null)
                .code(level.getCode())
                .name(level.getName())
                .description(level.getDescription())
                .displayOrder(level.getDisplayOrder())
                .basePrice(level.getBasePrice())
                .durationWeeks(level.getDurationWeeks())
                .isActive(level.getIsActive())
                .createdAt(level.getCreatedAt())
                .build();
    }
}
