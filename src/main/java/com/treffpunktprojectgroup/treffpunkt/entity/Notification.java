package com.treffpunktprojectgroup.treffpunkt.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "type")
    private String type;

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "is_read")
    private Boolean read = false;

    public Notification() {}

    public Notification(User user, String type, Activity activity, String message) {
        this.user = user;
        this.type = type;
        this.activity = activity;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.read = false;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getType() { return type; }
    public Activity getActivity() { return activity; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public Boolean getRead() { return read; }

    public void setRead(Boolean read) { this.read = read; }
}
