package com.elc.system.modules.school.course.service;

import com.elc.system.modules.school.course.dto.LevelDto.CreateLevelRequest;
import com.elc.system.modules.school.course.dto.LevelDto.LevelResponse;
import com.elc.system.modules.school.course.dto.LevelDto.UpdateLevelRequest;
import com.elc.system.modules.school.course.entity.Level;
import com.elc.system.modules.school.course.repository.CourseRepository;
import com.elc.system.modules.school.course.repository.LevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LevelService {

    private final LevelRepository levelRepository;
    private final CourseRepository courseRepository;

    public List<LevelResponse> getAllLevels() {
        return levelRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public LevelResponse getLevelById(UUID id) {
        return mapToResponse(findLevelById(id));
    }

    @Transactional
    public LevelResponse createLevel(CreateLevelRequest request) {
        String normalizedCode = normalizeCode(request.getCode());

        if (levelRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Level code already exists: " + normalizedCode);
        }

        Level level = Level.builder()
                .code(normalizedCode)
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder())
                .active(request.getActive() == null || request.getActive())
                .build();

        return mapToResponse(levelRepository.save(level));
    }

    @Transactional
    public LevelResponse updateLevel(UUID id, UpdateLevelRequest request) {
        Level level = findLevelById(id);
        String normalizedCode = normalizeCode(request.getCode());

        levelRepository.findByCodeIgnoreCase(normalizedCode)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Level code already exists: " + normalizedCode);
                });

        level.setCode(normalizedCode);
        level.setName(request.getName());
        level.setDescription(request.getDescription());
        level.setDisplayOrder(request.getDisplayOrder());
        level.setActive(request.getActive() == null || request.getActive());

        return mapToResponse(levelRepository.save(level));
    }

    @Transactional
    public void deleteLevel(UUID id) {
        Level level = findLevelById(id);

        if (courseRepository.existsByLevelId(id)) {
            throw new IllegalArgumentException("Cannot delete level because it is being used by one or more courses");
        }

        levelRepository.delete(level);
    }

    public Level findLevelById(UUID id) {
        return levelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Level not found with id: " + id));
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private LevelResponse mapToResponse(Level level) {
        return LevelResponse.builder()
                .id(level.getId())
                .code(level.getCode())
                .name(level.getName())
                .description(level.getDescription())
                .displayOrder(level.getDisplayOrder())
                .active(level.isActive())
                .createdAt(level.getCreatedAt())
                .updatedAt(level.getUpdatedAt())
                .build();
    }
}
