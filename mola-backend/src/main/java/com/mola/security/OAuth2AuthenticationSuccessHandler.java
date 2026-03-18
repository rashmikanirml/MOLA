package com.mola.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    @Value("${app.oauth2.redirect-uri:http://localhost:3000/}")
    private String redirectUri;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User user = (OAuth2User) authentication.getPrincipal();
        String email = user.getAttribute("email");
        if (email == null || email.isBlank()) {
            email = user.getName();
        }

        String role = "ROLE_USER";
        String token = jwtUtil.generateToken(email, role);

        String redirectTarget = String.format(
                "%s?token=%s&role=%s&username=%s",
                redirectUri,
                URLEncoder.encode(token, StandardCharsets.UTF_8),
                URLEncoder.encode(role, StandardCharsets.UTF_8),
                URLEncoder.encode(email, StandardCharsets.UTF_8)
        );

        response.sendRedirect(redirectTarget);
    }
}
