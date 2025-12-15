package com.treffpunktprojectgroup.treffpunkt.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;
import com.treffpunktprojectgroup.treffpunkt.enums.Category;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@Table(name = "activity")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activityId")
    private Integer activityId;

    @Column(name = "name")
    private String name;

    @Column(name = "location")
    private String location;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "kapasite")
    private Integer capacity;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category;

    @Column(name = "numberOfParticipant", nullable = false)
    private Integer numberOfParticipant = 0;

    @Column(name = "activityImage")
    private String activityImage;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    public Activity(String name,
                    String location,
                    LocalDate startDate,
                    LocalTime startTime,
                    Integer activityId,
                    Integer capacity,
                    Integer numberOfParticipant,
                    String description,
                    Category category,
                    User creator,
                    String activityImage) {
        this.activityId = activityId;
        this.name = name;
        this.location = location;
        this.startDate = startDate;
        this.capacity = capacity;
        this.startTime = startTime;
        this.numberOfParticipant = numberOfParticipant;
        this.description = description;
        this.category = category;
        this.creator = creator;
        this.activityImage = activityImage;
    }

    @ManyToMany
    @JoinTable(
            name = "activity_participants",
            joinColumns = @JoinColumn(name = "activity_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private Set<User> participants = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "activity_discarded_users",
            joinColumns = @JoinColumn(name = "activity_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private Set<User> discardedUsers = new HashSet<>();

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    public Integer getActivityId() {
        return activityId;
    }

    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
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

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public Set<User> getParticipants() { return participants; }

    public void addParticipant(User user) { this.participants.add(user); }

    public void removeParticipant(User user) { this.participants.remove(user); }

    public Set<User> getDiscardedUsers() { return discardedUsers; }

    public void addDiscardedUser(User user) { this.discardedUsers.add(user); }

    public boolean isUserDiscarded(User user) { return discardedUsers.contains(user); }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getNumberOfParticipant() {
        return numberOfParticipant;
    }

    public void setNumberOfParticipant(Integer numberOfParticipant) {
        this.numberOfParticipant = numberOfParticipant;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(Boolean completed) {
        isCompleted = completed;
    }

    public String getActivityImage() {
        return activityImage;
    }

    public void setActivityImage(String activityImage) {
        this.activityImage = activityImage;
    }

    public Boolean getCompleted() {
        return isCompleted;
    }

    public Activity() {
    }
}
