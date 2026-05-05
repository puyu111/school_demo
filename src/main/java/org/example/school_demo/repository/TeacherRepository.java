package org.example.school_demo.repository;

import org.example.school_demo.entity.TeacherEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<TeacherEntity, Long> {

    Optional<TeacherEntity> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT t FROM TeacherEntity t WHERE t.id = :id")
    Optional<TeacherEntity> findByBusinessId(@Param("id") String id);

    Page<TeacherEntity> findByNameContaining(String name, Pageable pageable);

    @Query("SELECT COUNT(t) > 0 FROM TeacherEntity t WHERE t.id = :id")
    boolean existsByBusinessId(@Param("id") String id);

    @Query("SELECT t FROM TeacherEntity t WHERE t.id IN :ids")
    List<TeacherEntity> findByIdIn(@Param("ids") List<String> ids);

    Page<TeacherEntity> findByDegreeContaining(String degree, Pageable pageable);
}
