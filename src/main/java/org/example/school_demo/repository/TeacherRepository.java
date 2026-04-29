package org.example.school_demo.repository;

import org.example.school_demo.entity.TeacherEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<TeacherEntity, Long> {

    Optional<TeacherEntity> findByName(String name);

    Optional<TeacherEntity> findById(String id);
}
