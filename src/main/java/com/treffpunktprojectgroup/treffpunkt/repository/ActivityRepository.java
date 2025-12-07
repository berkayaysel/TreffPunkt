package com.treffpunktprojectgroup.treffpunkt.repository;

import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import org.hibernate.tool.schema.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findByParticipants_UserId(Integer userId);
    List<Activity> findByCreator(User creator);
    List<Activity> findByParticipantsContains(User user);
    List<Activity> findByCategory(com.treffpunktprojectgroup.treffpunkt.enums.Category category);

    List<Activity> findByCapacityGreaterThan(Integer capacity);
}
