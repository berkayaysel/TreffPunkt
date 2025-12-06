package com.treffpunktprojectgroup.treffpunkt.dto;

public class UserProfileResponse {

    private String name;
    private String surname;
    private String email;
    private String address;
    private String profileImage;
    private java.time.LocalDate birthDate;
    public UserProfileResponse(String name, String surname, String email, String address, String profileImage, java.time.LocalDate birthDate) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.address = address;
        this.profileImage = profileImage;
        this.birthDate = birthDate;
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
}