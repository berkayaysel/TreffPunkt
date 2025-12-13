package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.MyActivitiesResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.ParticipantDTO;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;

import java.util.List;

public interface ActivityService {
    boolean joinActivity(String email, Integer activityId);
    boolean leaveActivity(String email, Integer activityId);
    List<ActivityResponse> getAllActivities();
    // Returns activities for the main dashboard, excluding activities created by the given email (if email!=null)
    List<ActivityResponse> getDashboardActivities(String currentUserEmail);
    List<ActivityResponse> getFilteredActivities(String categoryLabel, Boolean available, String dateOrder);
    MyActivitiesResponse getMyActivities(String email);
    boolean deleteActivity(String email, Integer activityId);
    List<ParticipantDTO> getActivityParticipants(Integer activityId);
    boolean removeParticipantFromActivity(String creatorEmail, Integer activityId, Integer participantUserId);
}
