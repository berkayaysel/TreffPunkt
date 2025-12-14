package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.CreateReviewRequest;
import com.treffpunktprojectgroup.treffpunkt.dto.ReviewResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.UserReviewSummaryResponse;

public interface ReviewService {

    ReviewResponse createReview(String reviewerEmail, CreateReviewRequest req);

    UserReviewSummaryResponse getReviewsForUser(Integer userId);
}
