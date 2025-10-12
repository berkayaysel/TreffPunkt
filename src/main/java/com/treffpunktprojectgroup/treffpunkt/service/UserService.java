package com.treffpunktprojectgroup.treffpunkt.service;

public interface UserService {
    boolean changePassword(Integer id, String oldPassword, String newPassword);
}
