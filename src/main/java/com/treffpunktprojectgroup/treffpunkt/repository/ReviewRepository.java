package com.treffpunktprojectgroup.treffpunkt.repository;

import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.Review;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    boolean existsByActivityAndReviewerAndReviewedUser(Activity activity, User reviewer, User reviewedUser);

    List<Review> findByReviewedUser_UserIdOrderByCreatedAtDesc(Integer userId);

    @Query("select avg(r.rating) from Review r where r.reviewedUser.userId = :userId")
    Double findAverageRatingByReviewedUserId(Integer userId);

    @Query("select count(r) from Review r where r.reviewedUser.userId = :userId")
    Long countByReviewedUserId(Integer userId);
}
