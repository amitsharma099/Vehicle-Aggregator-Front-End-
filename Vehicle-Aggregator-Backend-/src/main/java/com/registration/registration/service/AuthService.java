
package com.registration.registration.service;

import com.registration.registration.dto.ChangePasswordRequest;
import com.registration.registration.dto.RegisterRequest;
import com.registration.registration.dto.UpdateUserRequest;
import com.registration.registration.entity.PasswordHistory;
import com.registration.registration.entity.User;
import com.registration.registration.repository.PasswordHistoryRepository;
import com.registration.registration.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordHistoryRepository passwordHistoryRepository;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PasswordHistoryRepository passwordHistoryRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordHistoryRepository = passwordHistoryRepository;
    }

    // POST: Register a new user
    @Transactional
    public User register(RegisterRequest request) {

        // 1. Confirm password check
        if (!request.getPassword()
                .equals(request.getConfirmPassword())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Password and confirm password do not match"
            );
        }

        // 2. Duplicate email check
        if (userRepository.existsByEmail(request.getEmail())) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already registered"
            );
        }

        // 3. Duplicate mobile check
        if (userRepository.existsByMobile(request.getMobile())) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Mobile number already registered"
            );
        }

        // 4. Create user
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());

        // 5. Hash password using BCrypt
        String encodedPassword =
                passwordEncoder.encode(request.getPassword());

        user.setPassword(encodedPassword);

        // 6. Save user
        User savedUser = userRepository.save(user);

        // 7. Save initial password hash in history
        passwordHistoryRepository.save(
            new PasswordHistory(savedUser, encodedPassword)
        );

        return savedUser;
    }

    // PUT: Update user details
    public User updateUser(
            Long id,
            UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User not found with ID: " + id
                ));

        // Preserve existing details when fields are omitted
        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null) {
            if (!request.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmail(
                        request.getEmail())) {

                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered"
                );
            }

            user.setEmail(request.getEmail());
        }

        if (request.getMobile() != null) {
            if (!request.getMobile().equals(user.getMobile())
                    && userRepository.existsByMobile(
                        request.getMobile())) {

                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Mobile number already registered"
                );
            }

            user.setMobile(request.getMobile());
        }

        return userRepository.save(user);
    }

    // GET: Retrieve all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET: Retrieve user by ID
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User not found with ID: " + id
                ));
    }

    // PUT: Change password
    @Transactional
    public void changePassword(
            Long id,
            ChangePasswordRequest request) {

        // 1. Find the user
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User not found with ID: " + id
                ));

        String currentHash = user.getPassword();

        // 2. Verify current password
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                currentHash)) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Current password is incorrect"
            );
        }

        String newPassword = request.getNewPassword();

        // 3. Prevent using the current password again
        if (passwordEncoder.matches(
                newPassword, currentHash)) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "You cannot reuse your current password"
            );
        }

        // 4. Retrieve the three latest password hashes
        List<PasswordHistory> history =
                passwordHistoryRepository
                    .findTop3ByUser_IdOrderByCreatedAtDescIdDesc(id);

        // 5. Prevent reuse of a recent password
        for (PasswordHistory oldPassword : history) {

            if (passwordEncoder.matches(
                    newPassword,
                    oldPassword.getPasswordHash())) {

                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot reuse any of your last three passwords"
                );
            }
        }

        // 6. Seed history for older accounts that do not yet
        // have password-history records.
        if (history.isEmpty()) {

            passwordHistoryRepository.save(
                new PasswordHistory(user, currentHash)
            );
        }

        // 7. Hash and update the password
        String newHash = passwordEncoder.encode(newPassword);

        user.setPassword(newHash);
        userRepository.save(user);

        // 8. Save the new hash in password history
        passwordHistoryRepository.save(
            new PasswordHistory(user, newHash)
        );
    }
}
