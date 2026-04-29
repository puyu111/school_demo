package org.example.school_demo.repository;

import org.example.school_demo.entity.RuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RuleRepository extends JpaRepository<RuleEntity, String> {
}
