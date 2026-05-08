package org.example.school_demo.repository;

import org.example.school_demo.entity.Major;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MajorRepository extends JpaRepository<Major, Long> {

    Page<Major> findByNameContaining(String name, Pageable pageable);

    boolean existsByName(String name);

    @Query("SELECT COUNT(m) > 0 FROM Major m WHERE m.id = :id")
    boolean existsByBusinessId(@Param("id") String id);

    @Query("SELECT m FROM Major m WHERE m.dbId IN :ids")
    List<Major> findByIdIn(@Param("ids") List<Long> ids);
}
