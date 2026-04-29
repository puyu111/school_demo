package org.example.school_demo.repository;

import org.example.school_demo.entity.DisabledDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisabledDateRepository extends JpaRepository<DisabledDate, Long> {

    List<DisabledDate> findByCalendarId(Long calendarId);

    void deleteByCalendarId(Long calendarId);
}
