package org.example.school_demo.repository;

import org.example.school_demo.entity.SemesterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 学期数据访问层接口
 */
@Repository
public interface SemesterRepo extends JpaRepository<SemesterEntity, Long> {

    /**
     * 根据学期名称查询
     */
    Optional<SemesterEntity> findBySemesterName(String semesterName);

    /**
     * 检查学期名称是否存在
     */
    boolean existsBySemesterName(String semesterName);
    /**
     * 查询所有学期（按开始日期排序）
     */

    List<SemesterEntity> findAllByOrderByStartDateDesc();
}