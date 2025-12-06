package com.treffpunktprojectgroup.treffpunkt.dto;

import java.time.LocalDate;

public class ProfileUpdateRequest {

    private String name;
    private String surname;
    private String email;
    private String address;
    private LocalDate birthDate;

    public ProfileUpdateRequest(String name, String surname, String email, String address, LocalDate birthDate) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.address = address;
        this.birthDate = birthDate;
    }

    public ProfileUpdateRequest() {
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
    
    public LocalDate getBirthDate() {
        return birthDate;
    }
    
    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }
}
