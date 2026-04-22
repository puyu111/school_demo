package org.example.school_demo.repository;

import org.example.school_demo.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 班级数据访问层接口
 */
@Repository
public interface ClassRepo extends JpaRepository<ClassEntity, Long> {

    /**
     * 根据班级名称模糊查询
     */
    List<ClassEntity> findByClassNameContaining(String className);

    /**
     * 根据专业 ID 查询
     */
    List<ClassEntity> findByMajorId(String majorId);

    /**
     * 根据年级查询
     */
    List<ClassEntity> findByGrade(String grade);

    /**
     * 根据专业 ID 和年级查询
     */
    List<ClassEntity> findByMajorIdAndGrade(String majorId, String grade);
}