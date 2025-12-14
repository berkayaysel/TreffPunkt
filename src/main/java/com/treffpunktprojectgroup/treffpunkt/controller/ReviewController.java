package com.treffpunktprojectgroup.treffpunkt.controller;

import com.treffpunktprojectgroup.treffpunkt.dto.CreateReviewRequest;
import com.treffpunktprojectgroup.treffpunkt.dto.ReviewResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.UserReviewSummaryResponse;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import com.treffpunktprojectgroup.treffpunkt.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    public ReviewController(ReviewService reviewService,
                            UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@RequestBody CreateReviewRequest req, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        String email = principal.getName();
        return ResponseEntity.ok(reviewService.createReview(email, req));
    }

    @GetMapping("/me")
    public ResponseEntity<UserReviewSummaryResponse> myReviews(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        String email = principal.getName();

        Integer myUserId = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı."))
                .getUserId();

        return ResponseEntity.ok(reviewService.getReviewsForUser(myUserId));
    }
}