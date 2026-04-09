package com.elc.system.modules.sms.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter
@Setter
public class Room extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer capacity = 30;

    @Enumerated(EnumType.STRING)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String equipment = "[]";
}
