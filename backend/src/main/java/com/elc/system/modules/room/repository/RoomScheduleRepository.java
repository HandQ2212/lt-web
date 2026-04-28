package com.elc.system.modules.room.repository;

import com.elc.system.modules.room.entity.RoomSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoomScheduleRepository extends JpaRepository<RoomSchedule, UUID> {

    @Query("SELECT rs FROM RoomSchedule rs WHERE rs.room.id = :roomId " +
            "AND ((rs.startTime < :endTime AND rs.endTime > :startTime))")
    List<RoomSchedule> findOverlappingSchedules(@Param("roomId") UUID roomId,
                                               @Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);

    @Query("SELECT rs FROM RoomSchedule rs WHERE rs.room.id = :roomId " +
            "AND :now BETWEEN rs.startTime AND rs.endTime")
    List<RoomSchedule> findCurrentSchedules(@Param("roomId") UUID roomId, @Param("now") LocalDateTime now);
}
