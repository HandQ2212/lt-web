package com.elc.system.modules.school.branch.service;

import com.elc.system.modules.school.branch.entity.Branch;
import com.elc.system.modules.school.branch.repository.BranchRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BranchServiceTest {

    @Mock
    private BranchRepository branchRepository;

    @InjectMocks
    private BranchService branchService;

    @Test
    void deleteBranch_whenBranchHasActiveClasses_throwsBadRequest() {
        UUID branchId = UUID.randomUUID();
        Branch branch = Branch.builder().name("Main Center").build();

        when(branchRepository.findById(branchId)).thenReturn(Optional.of(branch));
        when(branchRepository.existsActiveClasses(branchId)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> branchService.deleteBranch(branchId));
        verify(branchRepository, never()).delete(branch);
    }

    @Test
    void deleteBranch_whenNoActiveClasses_deletesSuccessfully() {
        UUID branchId = UUID.randomUUID();
        Branch branch = Branch.builder().name("Main Center").build();

        when(branchRepository.findById(branchId)).thenReturn(Optional.of(branch));
        when(branchRepository.existsActiveClasses(branchId)).thenReturn(false);

        assertDoesNotThrow(() -> branchService.deleteBranch(branchId));
        verify(branchRepository).delete(branch);
    }
}
