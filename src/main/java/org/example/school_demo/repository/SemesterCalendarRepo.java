package org.example.school_demo.repository;

import org.example.school_demo.entity.SemesterCalendarEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SemesterCalendarRepo extends JpaRepository<SemesterCalendarEntity, Long> {

    Optional<SemesterCalendarEntity> findBySemesterName(String semesterName);

    boolean existsBySemesterName(String semesterName);
}
