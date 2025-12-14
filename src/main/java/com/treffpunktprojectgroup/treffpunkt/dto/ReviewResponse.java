package com.treffpunktprojectgroup.treffpunkt.dto;

import java.time.LocalDateTime;

public class ReviewResponse {
    private Integer reviewId;
    private Integer activityId;

    private Integer reviewerId;
    private String reviewerName;
    private String reviewerSurname;
    private String reviewerProfileImage;

    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewResponse(Integer reviewId, Integer activityId,
                          Integer reviewerId, String reviewerName, String reviewerSurname, String reviewerProfileImage,
                          Integer rating, String comment, LocalDateTime createdAt) {
        this.reviewId = reviewId;
        this.activityId = activityId;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.reviewerSurname = reviewerSurname;
        this.reviewerProfileImage = reviewerProfileImage;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Integer getReviewId() { return reviewId; }
    public Integer getActivityId() { return activityId; }

    public Integer getReviewerId() { return reviewerId; }
    public String getReviewerName() { return reviewerName; }
    public String getReviewerSurname() { return reviewerSurname; }
    public String getReviewerProfileImage() { return reviewerProfileImage; }

    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
