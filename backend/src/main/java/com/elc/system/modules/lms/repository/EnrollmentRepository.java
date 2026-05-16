package com.elc.system.modules.lms.repository;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserStatus;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.clazz c LEFT JOIN FETCH c.teacher WHERE e.student.id = :studentId")
    List<Enrollment> findByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.clazz c LEFT JOIN FETCH c.teacher WHERE e.student.id IN :studentIds")
    List<Enrollment> findByStudentIdIn(@Param("studentIds") List<UUID> studentIds);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.clazz c LEFT JOIN FETCH c.teacher WHERE c.id = :classId")
    List<Enrollment> findByClazzId(@Param("classId") UUID classId);

    default List<User> findActiveStudentsByClassId(UUID classId) {
        return findStudentsByClassIdAndStatuses(
                classId,
                List.of(EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED, EnrollmentStatus.ACTIVE),
                UserStatus.ACTIVE
        );
    }

    @Query("""
            SELECT DISTINCT e.student
            FROM Enrollment e
            WHERE e.clazz.id = :classId
              AND e.status IN :statuses
              AND e.student.status = :studentStatus
            """)
    List<User> findStudentsByClassIdAndStatuses(
            @Param("classId") UUID classId,
            @Param("statuses") List<EnrollmentStatus> statuses,
            @Param("studentStatus") UserStatus studentStatus
    );
    
    boolean existsByStudentIdAndClazzId(UUID studentId, UUID classId);
    Optional<Enrollment> findByStudentIdAndClazzId(UUID studentId, UUID classId);

    long countByClazzBranchId(UUID branchId);

    long countByClazzIdAndStatusIn(UUID classId, List<EnrollmentStatus> statuses);

    @Query("""
            SELECT e.clazz.id, COUNT(e)
            FROM Enrollment e
            WHERE e.clazz.id IN :classIds
              AND e.status IN :statuses
            GROUP BY e.clazz.id
            """)
    List<Object[]> countByClazzIdInAndStatusIn(
            @Param("classIds") List<UUID> classIds,
            @Param("statuses") List<EnrollmentStatus> statuses
    );
}
