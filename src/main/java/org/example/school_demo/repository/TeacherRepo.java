package org.example.school_demo.repository;

import org.example.school_demo.entity.TeacherEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 教师数据访问层接口
 */
@Repository
public interface TeacherRepo extends JpaRepository<TeacherEntity, Long> {

    /**
     * 根据工号查询教师
     */
    Optional<TeacherEntity> findByJobNumber(String jobNumber);

    /**
     * 检查工号是否存在
     */
    boolean existsByJobNumber(String jobNumber);

    /**
     * 根据姓名模糊查询
     */
    Page<TeacherEntity> findByNameContaining(String name, Pageable pageable);

    /**
     * 根据院系查询
     */
    List<TeacherEntity> findByDepartment(String department);
}