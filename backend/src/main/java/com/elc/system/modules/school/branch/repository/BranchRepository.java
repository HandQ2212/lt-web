package com.elc.system.modules.school.branch.repository;

import com.elc.system.modules.school.branch.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM public.classes c
                JOIN public.rooms r ON r.id = c.room_id
                WHERE r.branch_id = :branchId
                  AND c.status IN ('ACCEPTING', 'FULL')
            )
            """, nativeQuery = true)
    boolean existsActiveClasses(@Param("branchId") UUID branchId);
}
