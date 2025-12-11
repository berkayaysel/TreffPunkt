package com.treffpunktprojectgroup.treffpunkt.dto;

public class ParticipantDTO {
    private Integer userId;
    private String name;
    private String surname;
    private String email;
    private String profileImage;

    public ParticipantDTO(Integer userId, String name, String surname, String email, String profileImage) {
        this.userId = userId;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.profileImage = profileImage;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
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

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}
