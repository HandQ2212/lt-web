package com.elc.system.modules.auth.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.sms.entity.Branch;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Size(min = 8)
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @NotBlank
    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    private String address;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
