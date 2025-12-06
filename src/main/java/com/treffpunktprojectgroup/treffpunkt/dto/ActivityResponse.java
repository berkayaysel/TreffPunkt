package com.treffpunktprojectgroup.treffpunkt.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ActivityResponse {

    private Integer activityId;
    private String name;
    private String location;
    private LocalDate startDate;
    private LocalTime startTime;
    private String description;
    private Integer numberOfParticipants;
    private Integer capacity;
    private String creatorEmail;

    public ActivityResponse(Integer activityId, String name, String location, LocalDate startDate, LocalTime startTime, String description, Integer numberOfParticipants, Integer capacity, String creatorEmail) {
        this.activityId = activityId;
        this.name = name;
        this.location = location;
        this.startDate = startDate;
        this.startTime = startTime;
        this.description = description;
        this.numberOfParticipants = numberOfParticipants;
        this.capacity = capacity;
        this.creatorEmail = creatorEmail;
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

    public Integer getActivityId() {
        return activityId;
    }

    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getNumberOfParticipants() {
        return numberOfParticipants;
    }

    public void setNumberOfParticipants(Integer numberOfParticipants) {
        this.numberOfParticipants = numberOfParticipants;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getCreatorEmail() {
        return creatorEmail;
    }

    public void setCreatorEmail(String creatorEmail) {
        this.creatorEmail = creatorEmail;
    }

    public ActivityResponse() {
    }
}
