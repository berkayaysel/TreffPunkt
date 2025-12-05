package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.MyActivitiesResponse;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;

import java.util.List;

public interface ActivityService {
    boolean joinActivity(String email, Integer activityId);
    boolean leaveActivity(String email, Integer activityId);
    List<ActivityResponse> getAllActivities();
    MyActivitiesResponse getMyActivities(String email);
}
