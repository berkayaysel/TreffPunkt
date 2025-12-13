package com.treffpunktprojectgroup.treffpunkt.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private String message;
    private Integer activityId;
    private String activityName;
    private String activityLocation;
    private String initiatorName;
    private LocalDateTime timestamp;
    private Boolean read;

    public NotificationDTO() {}

    public NotificationDTO(Long id, String message, Integer activityId, String activityName, String activityLocation, String initiatorName, LocalDateTime timestamp, Boolean read) {
        this.id = id;
        this.message = message;
        this.activityId = activityId;
        this.activityName = activityName;
        this.activityLocation = activityLocation;
        this.initiatorName = initiatorName;
        this.timestamp = timestamp;
        this.read = read;
    }

    public Long getId() { return id; }
    public String getMessage() { return message; }
    public Integer getActivityId() { return activityId; }
    public String getActivityName() { return activityName; }
    public String getActivityLocation() { return activityLocation; }
    public String getInitiatorName() { return initiatorName; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public Boolean getRead() { return read; }
}
