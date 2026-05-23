package com.elc.system.modules.announcement.repository;

import com.elc.system.modules.announcement.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
    @Query("SELECT a FROM Announcement a WHERE a.active = true AND (a.expiresAt IS NULL OR a.expiresAt > :now)")
    Page<Announcement> findActiveAnnouncements(@Param("now") ZonedDateTime now, Pageable pageable);

    Page<Announcement> findByCreatedByIdOrderByCreatedAtDesc(UUID createdById, Pageable pageable);
}
