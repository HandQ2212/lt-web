package com.elc.system.modules.school.branch.service;

import com.elc.system.modules.school.branch.dto.BranchDto.BranchResponse;
import com.elc.system.modules.school.branch.dto.BranchDto.CreateBranchRequest;
import com.elc.system.modules.school.branch.dto.BranchDto.UpdateBranchRequest;
import com.elc.system.modules.school.branch.entity.Branch;
import com.elc.system.modules.school.branch.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public BranchResponse getBranchById(UUID id) {
        return mapToResponse(findBranchById(id));
    }

    @Transactional
    public BranchResponse createBranch(CreateBranchRequest request) {
        Branch branch = Branch.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .build();

        return mapToResponse(branchRepository.save(branch));
    }

    @Transactional
    public BranchResponse updateBranch(UUID id, UpdateBranchRequest request) {
        Branch branch = findBranchById(id);
        branch.setName(request.getName());
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());

        return mapToResponse(branchRepository.save(branch));
    }

    @Transactional
    public void deleteBranch(UUID id) {
        Branch branch = findBranchById(id);

        if (branchRepository.existsActiveClasses(id)) {
            throw new IllegalArgumentException("Cannot delete branch while it still has active classes");
        }

        try {
            branchRepository.delete(branch);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Cannot delete branch because it is referenced by other records");
        }
    }

    private Branch findBranchById(UUID id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Branch not found with id: " + id));
    }

    private BranchResponse mapToResponse(Branch branch) {
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .createdAt(branch.getCreatedAt())
                .updatedAt(branch.getUpdatedAt())
                .build();
    }
}
