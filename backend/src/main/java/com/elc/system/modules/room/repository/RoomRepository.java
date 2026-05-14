package com.elc.system.modules.room.repository;

import com.elc.system.modules.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    boolean existsByNameAndBranchId(String name, UUID branchId);
}
