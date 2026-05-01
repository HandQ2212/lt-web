package com.elc.system.modules.sms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.sms.dto.BranchDto.BranchRequest;
import com.elc.system.modules.sms.dto.BranchDto.BranchResponse;
import com.elc.system.modules.sms.entity.Branch;
import com.elc.system.modules.sms.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;

    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BranchResponse createBranch(BranchRequest request) {
        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
        }

        Branch branch = Branch.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .manager(manager)
                .build();

        return mapToResponse(branchRepository.save(branch));
    }

    public BranchResponse getBranchById(UUID id) {
        return mapToResponse(branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found")));
    }

    @Transactional
    public BranchResponse updateBranch(UUID id, BranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        
        branch.setName(request.getName());
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());
        
        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            branch.setManager(manager);
        } else {
            branch.setManager(null);
        }

        return mapToResponse(branchRepository.save(branch));
    }

    @Transactional
    public void deleteBranch(UUID id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        
        try {
            branchRepository.delete(branch);
        } catch (Exception ex) {
            throw new RuntimeException("Cannot delete branch because it is referenced by other records");
        }
    }

    private BranchResponse mapToResponse(Branch branch) {
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .managerId(branch.getManager() != null ? branch.getManager().getId() : null)
                .managerName(branch.getManager() != null ? branch.getManager().getFullName() : null)
                .build();
    }
}
