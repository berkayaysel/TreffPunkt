package com.treffpunktprojectgroup.treffpunkt.dto;

import java.util.List;

public class UserProfileResponse {

    private String name;
    private String surname;
    private String email;
    private String address;
    private String profileImage;
    private java.time.LocalDate birthDate;
    private Double averageRating;
    private Long reviewCount;
    private Integer createdCount;
    private Integer participatedCount;
    private List<ReviewResponse> reviews;

    public UserProfileResponse(String name, String surname, String email, String address, String profileImage, java.time.LocalDate birthDate,
                               Double averageRating, Long reviewCount, Integer createdCount, Integer participatedCount, List<ReviewResponse> reviews) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.address = address;
        this.profileImage = profileImage;
        this.birthDate = birthDate;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
        this.createdCount = createdCount;
        this.participatedCount = participatedCount;
        this.reviews = reviews;
    }

    public UserProfileResponse() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
    public java.time.LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(java.time.LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Long getReviewCount() { return reviewCount; }
    public void setReviewCount(Long reviewCount) { this.reviewCount = reviewCount; }

    public List<ReviewResponse> getReviews() { return reviews; }
    public void setReviews(List<ReviewResponse> reviews) { this.reviews = reviews; }

    public Integer getCreatedCount() { return createdCount; }

    public void setCreatedCount(Integer createdCount) { this.createdCount = createdCount; }

    public Integer getParticipatedCount() { return participatedCount; }

    public void setParticipatedCount(Integer participatedCount) { this.participatedCount = participatedCount; }
}