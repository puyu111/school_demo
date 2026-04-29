package org.example.school_demo.repository;

import org.example.school_demo.entity.UnavailableDateEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnavailableDateRepository extends JpaRepository<UnavailableDateEntity, String> {

    List<UnavailableDateEntity> findByTeacherId(String teacherId);

    List<UnavailableDateEntity> findByType(String type);

    Optional<UnavailableDateEntity> findByTeacherIdAndReason(String teacherId, String reason);
}
