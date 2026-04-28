package com.elc.system.modules.sms.service;

import com.elc.system.modules.sms.dto.LevelDto.LevelRequest;
import com.elc.system.modules.sms.dto.LevelDto.LevelResponse;
import com.elc.system.modules.sms.entity.CourseLevel;
import com.elc.system.modules.sms.entity.Level;
import com.elc.system.modules.sms.repository.CourseRepository;
import com.elc.system.modules.sms.repository.LevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LevelService {

    private final LevelRepository levelRepository;
    private final CourseRepository courseRepository;

    public List<LevelResponse> getAllLevels() {
        return levelRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LevelResponse getLevelById(UUID id) {
        return levelRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Level not found"));
    }

    @Transactional
    public LevelResponse createLevel(LevelRequest request) {
        String normalizedCode = normalizeCode(request.getCode());
        if (levelRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Level code already exists");
        }

        Level level = Level.builder()
                .code(normalizedCode)
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder())
                .isActive(request.getIsActive() == null || request.getIsActive())
                .build();

        return mapToResponse(levelRepository.save(level));
    }

    @Transactional
    public LevelResponse updateLevel(UUID id, LevelRequest request) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Level not found"));

        String normalizedCode = normalizeCode(request.getCode());
        if (levelRepository.existsByCodeIgnoreCaseAndIdNot(normalizedCode, id)) {
            throw new IllegalArgumentException("Level code already exists");
        }

        level.setCode(normalizedCode);
        level.setName(request.getName());
        level.setDescription(request.getDescription());
        level.setDisplayOrder(request.getDisplayOrder());
        level.setIsActive(request.getIsActive() == null || request.getIsActive());

        return mapToResponse(levelRepository.save(level));
    }

    @Transactional
    public void deleteLevel(UUID id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Level not found"));

        CourseLevel courseLevel = resolveCourseLevel(level.getCode());
        if (courseLevel != null && !courseRepository.findByLevel(courseLevel).isEmpty()) {
            throw new IllegalArgumentException("Level is already used by courses");
        }

        levelRepository.delete(level);
    }

    private CourseLevel resolveCourseLevel(String code) {
        try {
            return CourseLevel.valueOf(code.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    private LevelResponse mapToResponse(Level level) {
        return LevelResponse.builder()
                .id(level.getId())
                .code(level.getCode())
                .name(level.getName())
                .description(level.getDescription())
                .displayOrder(level.getDisplayOrder())
                .isActive(level.getIsActive())
                .build();
    }
}
