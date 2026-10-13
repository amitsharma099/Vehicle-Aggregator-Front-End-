
package com.registration.registration.repository;

import com.registration.registration.entity.PasswordHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordHistoryRepository
        extends JpaRepository<PasswordHistory, Long> {

    List<PasswordHistory>
        findTop3ByUser_IdOrderByCreatedAtDescIdDesc(Long userId);
}
