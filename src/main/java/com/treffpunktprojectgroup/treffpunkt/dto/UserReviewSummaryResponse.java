package com.treffpunktprojectgroup.treffpunkt.dto;

import java.util.List;

public class UserReviewSummaryResponse {
    private Double averageRating;
    private Long reviewCount;
    private List<ReviewResponse> reviews;

    public UserReviewSummaryResponse(Double averageRating, Long reviewCount, List<ReviewResponse> reviews) {
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
        this.reviews = reviews;
    }

    public Double getAverageRating() { return averageRating; }
    public Long getReviewCount() { return reviewCount; }
    public List<ReviewResponse> getReviews() { return reviews; }
}
