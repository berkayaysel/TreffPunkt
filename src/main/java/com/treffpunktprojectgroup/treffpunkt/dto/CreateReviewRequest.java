package com.treffpunktprojectgroup.treffpunkt.dto;

public class CreateReviewRequest {
    private Integer activityId;

    private String reviewedUserEmail;

    private Integer rating; // 1-5
    private String comment;

    public Integer getActivityId() { return activityId; }
    public void setActivityId(Integer activityId) { this.activityId = activityId; }

    public String getReviewedUserEmail() { return reviewedUserEmail; }
    public void setReviewedUserEmail(String reviewedUserEmail) { this.reviewedUserEmail = reviewedUserEmail; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
