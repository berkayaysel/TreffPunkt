package com.treffpunktprojectgroup.treffpunkt.dto;

public class JoinActivityRequest {
    private Integer userId;
    private Integer activityId;

    public JoinActivityRequest(Integer userId, Integer activityId) {
        this.userId = userId;
        this.activityId = activityId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getActivityId() {
        return activityId;
    }

    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
    }

    public JoinActivityRequest() {
    }
}
