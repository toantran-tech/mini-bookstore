package com.amigoscode.controller;

import com.amigoscode.Entity.User;
import com.amigoscode.dto.RegisterRequest;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.security.JwtUtil;
import com.amigoscode.service.EmailService;
import com.amigoscode.service.OtpStore;
import com.amigoscode.service.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    @Test
    void registrationAlwaysCreatesRegularUserEvenWhenUsernameIsAdmin() {
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        UserDetailsService userDetailsService = mock(UserDetailsService.class);
        JwtUtil jwtUtil = mock(JwtUtil.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        UserRepository userRepository = mock(UserRepository.class);
        EmailService emailService = mock(EmailService.class);
        OtpStore otpStore = mock(OtpStore.class);
        RefreshTokenService refreshTokenService = mock(RefreshTokenService.class);

        when(userRepository.findByUsername("admin")).thenReturn(Optional.empty());
        when(otpStore.verify("admin@example.com", "123456")).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");

        AuthController controller = new AuthController(
                authenticationManager,
                userDetailsService,
                jwtUtil,
                passwordEncoder,
                userRepository,
                emailService,
                otpStore,
                refreshTokenService
        );

        RegisterRequest request = new RegisterRequest();
        request.setUsername("admin");
        request.setEmail("admin@example.com");
        request.setPassword("strong-password");
        request.setOtp("123456");

        controller.register(request);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertThat(savedUser.getValue().getRole()).isEqualTo("ROLE_USER");
    }
}