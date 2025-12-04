package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.MyActivitiesResponse;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;

import java.util.List;

public interface ActivityService {
    boolean joinActivity(Integer userId, Integer activityId);
    boolean leaveActivity(Integer userId, Integer activityId);
    List<ActivityResponse> getAllActivities();
    MyActivitiesResponse getMyActivities(String email);
}
