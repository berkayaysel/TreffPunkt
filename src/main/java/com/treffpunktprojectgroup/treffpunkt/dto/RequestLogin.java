package com.treffpunktprojectgroup.treffpunkt.dto;

public class RequestLogin {

    private Integer id;
    private String password;

    public RequestLogin(Integer id, String password) {
        this.id = id;
        this.password = password;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public RequestLogin() {
    }
}
