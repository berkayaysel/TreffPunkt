package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.CreateReviewRequest;
import com.treffpunktprojectgroup.treffpunkt.dto.ReviewResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.UserReviewSummaryResponse;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.Review;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.ActivityRepository;
import com.treffpunktprojectgroup.treffpunkt.repository.ReviewRepository;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import com.treffpunktprojectgroup.treffpunkt.service.ReviewService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             UserRepository userRepository,
                             ActivityRepository activityRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    @Override
    public ReviewResponse createReview(String reviewerEmail, CreateReviewRequest req) {

        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new IllegalArgumentException("Puan 1 ile 5 arasında olmalı.");
        }

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı."));

        Activity activity = activityRepository.findById(req.getActivityId())
                .orElseThrow(() -> new IllegalArgumentException("Aktivite bulunamadı."));

        if (activity.isCompleted() == null || !activity.isCompleted()) {
            throw new IllegalStateException("Aktivite tamamlanmadan değerlendirme yapılamaz.");
        }

        // ✅ reviewed user email ile
        if (req.getReviewedUserEmail() == null || req.getReviewedUserEmail().isBlank()) {
            throw new IllegalArgumentException("Değerlendirilecek kullanıcının email'i boş olamaz.");
        }

        User reviewedUser = userRepository.findByEmail(req.getReviewedUserEmail())
                .orElseThrow(() -> new IllegalArgumentException("Değerlendirilecek kullanıcı bulunamadı."));

        if (reviewer.getUserId().equals(reviewedUser.getUserId())) {
            throw new IllegalArgumentException("Kendinize değerlendirme yapamazsınız.");
        }

        if (!isUserInActivity(activity, reviewer) || !isUserInActivity(activity, reviewedUser)) {
            throw new IllegalStateException("Sadece aynı aktiviteye katılan kullanıcılar birbirini değerlendirebilir.");
        }

        if (reviewRepository.existsByActivityAndReviewerAndReviewedUser(activity, reviewer, reviewedUser)) {
            throw new IllegalStateException("Bu kullanıcıyı bu aktivite için zaten değerlendirdiniz.");
        }

        Review review = new Review();
        review.setActivity(activity);
        review.setReviewer(reviewer);
        review.setReviewedUser(reviewedUser);
        review.setRating(req.getRating());
        review.setComment(req.getComment());

        Review saved = reviewRepository.save(review);

        return new ReviewResponse(
                saved.getReviewId(),
                activity.getActivityId(),
                reviewer.getUserId(),
                reviewer.getName(),
                reviewer.getSurname(),
                reviewer.getProfileImage(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }

    @Override
    public UserReviewSummaryResponse getReviewsForUser(Integer userId) {

        Double avg = reviewRepository.findAverageRatingByReviewedUserId(userId);
        Long count = reviewRepository.countByReviewedUserId(userId);

        List<ReviewResponse> list = reviewRepository
                .findByReviewedUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(r -> new ReviewResponse(
                        r.getReviewId(),
                        r.getActivity().getActivityId(),
                        r.getReviewer().getUserId(),
                        r.getReviewer().getName(),
                        r.getReviewer().getSurname(),
                        r.getReviewer().getProfileImage(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt()
                ))
                .toList();

        return new UserReviewSummaryResponse(
                avg == null ? 0.0 : avg,
                count == null ? 0L : count,
                list
        );
    }

    private boolean isUserInActivity(Activity activity, User user) {
        if (activity.getCreator() != null &&
                activity.getCreator().getUserId().equals(user.getUserId())) {
            return true;
        }

        return activity.getParticipants() != null &&
                activity.getParticipants().contains(user);
    }
}
