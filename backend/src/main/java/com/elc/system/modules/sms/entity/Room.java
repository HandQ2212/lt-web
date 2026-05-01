package com.elc.system.modules.sms.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a classroom in a branch.
 * Mapped to public.rooms table.
 */
@Entity(name = "SmsRoom")
@Table(name = "rooms", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    private String name;

    private Integer capacity;

    @Column(name = "room_type")
    private String roomType;
}
