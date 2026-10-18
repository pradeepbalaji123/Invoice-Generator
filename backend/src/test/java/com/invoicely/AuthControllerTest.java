package com.invoicely;

import com.invoicely.controller.AuthController;
import com.invoicely.dto.AuthRequest;
import com.invoicely.dto.AuthResponse;
import com.invoicely.dto.RegisterRequest;
import com.invoicely.dto.UserDto;
import com.invoicely.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    @DisplayName("Should successfully register a new user")
    void shouldRegisterUser() {
        UserDto userDto = new UserDto(1L, "Harsanth R", "harsanth@example.com", "DevOps Corp", "Chennai", "9998887776", null);
        AuthResponse authResponse = new AuthResponse("mock-jwt-token-12345", userDto);

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        RegisterRequest req = new RegisterRequest();
        req.setName("Harsanth R");
        req.setEmail("harsanth@example.com");
        req.setPassword("Password123");
        req.setCompanyName("DevOps Corp");
        req.setAddress("Chennai");

        ResponseEntity<AuthResponse> response = authController.register(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getToken()).isEqualTo("mock-jwt-token-12345");
        assertThat(response.getBody().getUser().getEmail()).isEqualTo("harsanth@example.com");
    }

    @Test
    @DisplayName("Should login user and return JWT token")
    void shouldLoginUser() {
        UserDto userDto = new UserDto(2L, "Sachin K", "sachin@example.com", "Sachin Enterprises", "Bangalore", "9112233445", null);
        AuthResponse authResponse = new AuthResponse("mock-jwt-login-token", userDto);

        when(authService.login(any(AuthRequest.class))).thenReturn(authResponse);

        AuthRequest req = new AuthRequest("sachin@example.com", "Password123");
        ResponseEntity<AuthResponse> response = authController.login(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getToken()).isEqualTo("mock-jwt-login-token");
    }
}
