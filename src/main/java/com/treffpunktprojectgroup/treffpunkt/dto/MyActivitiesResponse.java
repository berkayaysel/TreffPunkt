package com.treffpunktprojectgroup.treffpunkt.dto;

import java.util.List;

public class MyActivitiesResponse {

    private List<ActivityResponse> created;
    private List<ActivityResponse> joined;

    public MyActivitiesResponse(List<ActivityResponse> created, List<ActivityResponse> joined) {
        this.created = created;
        this.joined = joined;
    }

    public MyActivitiesResponse() {
    }

    public List<ActivityResponse> getCreated() {
        return created;
    }

    public void setCreated(List<ActivityResponse> created) {
        this.created = created;
    }

    public List<ActivityResponse> getJoined() {
        return joined;
    }

    public void setJoined(List<ActivityResponse> joined) {
        this.joined = joined;
    }
}
