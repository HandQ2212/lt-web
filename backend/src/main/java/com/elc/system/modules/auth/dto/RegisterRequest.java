package com.elc.system.modules.auth.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
}
