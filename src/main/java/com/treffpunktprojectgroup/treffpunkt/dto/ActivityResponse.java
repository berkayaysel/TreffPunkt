package com.treffpunktprojectgroup.treffpunkt.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ActivityResponse {

    private String name;
    private String location;
    private LocalDate startDate;
    private LocalTime startTime;

    public ActivityResponse(String name, String location, LocalDate startDate, LocalTime startTime) {
        this.name = name;
        this.location = location;
        this.startDate = startDate;
        this.startTime = startTime;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public ActivityResponse() {
    }
}
