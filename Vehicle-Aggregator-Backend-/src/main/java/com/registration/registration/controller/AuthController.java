package com.registration.registration.controller;

import com.registration.registration.dto.ChangePasswordRequest;
import com.registration.registration.dto.RegisterRequest;
import com.registration.registration.dto.UpdateUserRequest;
import com.registration.registration.dto.UserResponse;
import com.registration.registration.entity.User;
import com.registration.registration.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@Tag(
    name = "Authentication",
    description = "Registration, user management and password APIs"
)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST: Register user
    @Operation(
        summary = "Register new user",
        description = "Register a user with validation, duplicate checks and BCrypt password hashing"
    )
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.ok(
            "User registered successfully"
        );
    }

    // PUT: Update user details
    @Operation(
        summary = "Update user",
        description = "Update name, email or mobile number"
    )
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {

        User updatedUser =
                authService.updateUser(id, request);

        return ResponseEntity.ok(
            new UserResponse(updatedUser)
        );
    }

    // GET: Retrieve all users
    @Operation(
        summary = "Get all users",
        description = "Retrieve registered users without exposing password hashes"
    )
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = authService.getAllUsers()
                .stream()
                .map(UserResponse::new)
                .toList();

        return ResponseEntity.ok(users);
    }

    // GET: Retrieve user by ID
    @Operation(
        summary = "Get user by ID",
        description = "Retrieve a user by ID without exposing the password hash"
    )
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        User user = authService.getUserById(id);

        return ResponseEntity.ok(
            new UserResponse(user)
        );
    }

    // PUT: Change password
    @Operation(
        summary = "Change user password",
        description = "Verify the current password, enforce password rules and prevent recent password reuse"
    )
    @PutMapping("/users/{id}/password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(id, request);

        return ResponseEntity.ok(
            "Password changed successfully"
        );
    }
}