package org.example.school_demo.repository;

import org.example.school_demo.entity.ReviewHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewHistoryRepository extends JpaRepository<ReviewHistory, Long> {

    List<ReviewHistory> findByApplicationIdOrderByTimestampDesc(String applicationId);

    Page<ReviewHistory> findByApplicationId(String applicationId, Pageable pageable);
}
