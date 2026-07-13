package com.amigoscode.controller;

import com.amigoscode.Entity.RefreshToken;
import com.amigoscode.Entity.User;
import com.amigoscode.dto.AuthRequest;
import com.amigoscode.dto.LoginResponse;
import com.amigoscode.dto.RegisterRequest;
import com.amigoscode.exception.ApiException;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.security.JwtUtil;
import com.amigoscode.service.EmailService;
import com.amigoscode.service.OtpStore;
import com.amigoscode.service.RefreshTokenService;

import jakarta.validation.Valid;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OtpStore otpStore;
    private final RefreshTokenService refreshTokenService;

    public AuthController(@Lazy AuthenticationManager authenticationManager,
            UserDetailsService userDetailsService,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            EmailService emailService,
            OtpStore otpStore,
            RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.otpStore = otpStore;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String username = body.get("username");

        if (email == null || email.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email không được để trống!");
        }

        if (username != null && userRepository.findByUsername(username).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại!");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email này đã được sử dụng!");
        }

        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        otpStore.save(email, otp);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity
                .ok(Map.of("message", "Mã OTP đã được gửi về email " + email + ". Có hiệu lực trong 5 phút."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại!");
        }

        if (!otpStore.verify(request.getEmail(), request.getOtp())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã OTP không đúng hoặc đã hết hạn!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Public registration must never grant elevated privileges.
        user.setRole("ROLE_USER");

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Tạo tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String accessToken = jwtUtil.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getUsername());
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("ROLE_USER");
        return ResponseEntity.ok(new LoginResponse(
                accessToken,
                refreshToken.getToken(),
                request.getUsername(),
                role));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String token = body.get("refreshToken");
        if (token == null || token.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu refreshToken");
        }

        Optional<RefreshToken> refreshTokenOpt = refreshTokenService.validateRefreshToken(token);
        if (refreshTokenOpt.isEmpty()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String username = refreshTokenOpt.get().getUsername();
        final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        final String newAccessToken = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken != null) {
            refreshTokenService.revokeToken(refreshToken);
        }
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

}