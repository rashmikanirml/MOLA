package com.mola.controller;

import com.mola.dto.LoginRequest;
import com.mola.dto.LoginResponse;
import com.mola.security.JwtUtil;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getUsername(),
                                request.getPassword()
                        )
                );

        User user = (User) authentication.getPrincipal();

        String role = user.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        String token = jwtUtil.generateToken(user.getUsername(), role);

        return new LoginResponse(token, role);
    }

        @GetMapping("/users")
        @PreAuthorize("hasRole('ADMIN')")
        public List<Map<String, String>> getSystemUsers() {
                return List.of(
                                Map.of("username", "admin", "role", "ROLE_ADMIN"),
                                Map.of("username", "user", "role", "ROLE_USER")
                );
        }
}