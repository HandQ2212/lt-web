package com.elc.system.modules.school.course.service;

import com.elc.system.modules.school.course.dto.LevelDto.CreateLevelRequest;
import com.elc.system.modules.school.course.entity.Level;
import com.elc.system.modules.school.course.repository.CourseRepository;
import com.elc.system.modules.school.course.repository.LevelRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LevelServiceTest {

    @Mock
    private LevelRepository levelRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private LevelService levelService;

    @Test
    void createLevel_normalizesCodeToUppercase() {
        CreateLevelRequest request = CreateLevelRequest.builder()
                .code("beginner")
                .name("Beginner")
                .build();

        Level persisted = Level.builder()
                .id(UUID.randomUUID())
                .code("BEGINNER")
                .name("Beginner")
                .build();

        when(levelRepository.existsByCodeIgnoreCase("BEGINNER")).thenReturn(false);
        when(levelRepository.save(any(Level.class))).thenReturn(persisted);

        String createdCode = levelService.createLevel(request).getCode();

        assertEquals("BEGINNER", createdCode);
    }

    @Test
    void deleteLevel_whenUsedByCourse_throwsBadRequest() {
        UUID levelId = UUID.randomUUID();
        Level level = Level.builder().code("ADVANCED").name("Advanced").build();

        when(levelRepository.findById(levelId)).thenReturn(Optional.of(level));
        when(courseRepository.existsByLevelId(levelId)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> levelService.deleteLevel(levelId));
    }
}
