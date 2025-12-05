package com.treffpunktprojectgroup.treffpunkt.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateActivityRequest {

    private String name;
    private String location;
    private Integer capacity;
    private LocalDate startDate;
    private LocalTime startTime;
    private String description;

    public CreateActivityRequest(String name,
                                 String location,
                                 Integer capacity,
                                 LocalDate startDate,
                                 LocalTime startTime,
                                 String description) {
        this.name = name;
        this.location = location;
        this.capacity = capacity;
        this.startDate = startDate;
        this.startTime = startTime;
        this.description = description;
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

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CreateActivityRequest() {
    }
}
