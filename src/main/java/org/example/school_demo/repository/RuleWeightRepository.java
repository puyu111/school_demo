package org.example.school_demo.repository;

import org.example.school_demo.entity.RuleWeightEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RuleWeightRepository extends JpaRepository<RuleWeightEntity, String> {

    List<RuleWeightEntity> findByCategory(String category);
}
