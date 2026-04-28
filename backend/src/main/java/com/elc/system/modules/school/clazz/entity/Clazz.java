package com.elc.system.modules.school.clazz.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "classes", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Clazz extends BaseEntity {
    
    @Column(nullable = false)
    private String name;

    @Column(name = "room_id")
    private UUID roomId;

    @Enumerated(EnumType.STRING)
    private ClazzStatus status;
}
