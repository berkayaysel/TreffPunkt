package com.treffpunktprojectgroup.treffpunkt.dto;

public class UserProfileResponse {

    private String name;
    private String surname;
    private String email;
    private Integer age;
    private String address;

    public UserProfileResponse(String name, String surname, String email, Integer age, String address) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.age = age;
        this.address = address;
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

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}