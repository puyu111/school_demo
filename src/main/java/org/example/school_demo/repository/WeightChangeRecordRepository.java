package org.example.school_demo.repository;

import org.example.school_demo.entity.WeightChangeRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeightChangeRecordRepository extends JpaRepository<WeightChangeRecordEntity, Long> {

    List<WeightChangeRecordEntity> findByRuleId(String ruleId);
}
