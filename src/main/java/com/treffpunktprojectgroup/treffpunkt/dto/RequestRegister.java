package com.treffpunktprojectgroup.treffpunkt.dto;

import com.treffpunktprojectgroup.treffpunkt.enums.Gender;

public class RequestRegister {

    private String name;
    private String surname;
    private String password;
    private Integer age;
    private String email;
    private String address;
    private Gender gender;


    public RequestRegister(String name,
                           String surname,
                           String password,
                           Integer age,
                           String email,
                           String address,
                           Gender gender) {
        this.name = name;
        this.surname = surname;
        this.password = password;
        this.age = age;
        this.email = email;
        this.address = address;
        this.gender = gender;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
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

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public RequestRegister() {
    }
}
