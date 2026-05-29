package com.amigoscode.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "Tên đăng nhập ko được để trống")
    private String username;
    @NotBlank(message = "Mật khẩu ko được để trống")
    private String password;
}