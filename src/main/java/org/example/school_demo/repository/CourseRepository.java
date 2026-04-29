package org.example.school_demo.repository;

import org.example.school_demo.entity.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<CourseEntity, Long> {

    Optional<CourseEntity> findByName(String name);

    Page<CourseEntity> findByNameContaining(String name, Pageable pageable);

    @Query("SELECT COUNT(c) > 0 FROM CourseEntity c WHERE c.id = :id")
    boolean existsByBusinessId(@Param("id") String id);

    @Query("SELECT c FROM CourseEntity c WHERE c.id IN :ids")
    List<CourseEntity> findByIdIn(@Param("ids") List<String> ids);
}
