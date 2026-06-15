package com.amigoscode.controller;

import com.amigoscode.Entity.User;
import com.amigoscode.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserSummary>> getAllUsers() {
        List<UserSummary> users = userRepository.findAll().stream()
                .map(UserSummary::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String newRole = body.get("role");

        if (newRole == null || (!newRole.equals("ROLE_USER") && !newRole.equals("ROLE_ADMIN"))) {
            throw new IllegalArgumentException("Role không hợp lệ! Chỉ chấp nhận ROLE_USER hoặc ROLE_ADMIN");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user với id " + id));

        if (user.getUsername().equals(auth.getName())) {
            throw new IllegalArgumentException("Không thể thay đổi role của chính mình!");
        }

        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Cập nhật role thành công!", "newRole", newRole));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user với id " + id));

        if (user.getUsername().equals(auth.getName())) {
            throw new IllegalArgumentException("Không thể xóa tài khoản của chính mình!");
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Xóa tài khoản thành công!"));
    }

    @Data
    public static class UserSummary {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String phone;

        public UserSummary(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.role = user.getRole();
            this.phone = user.getPhone();
        }
    }
}
