package com.treffpunktprojectgroup.treffpunkt.service;

public interface ActivityService {
    boolean joinActivity(Integer userId, Integer activityId);
    boolean leaveActivity(Integer userId, Integer activityId);
}
