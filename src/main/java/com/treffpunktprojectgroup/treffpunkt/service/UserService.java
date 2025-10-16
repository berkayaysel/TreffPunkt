package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.CreateActivityRequestDto;
import com.treffpunktprojectgroup.treffpunkt.dto.RequestRegister;
import com.treffpunktprojectgroup.treffpunkt.entity.User;

public interface UserService {
    boolean changePassword(Integer id, String oldPassword, String newPassword);
    User register(RequestRegister requestRegister);
    void createActivity(CreateActivityRequestDto createActivityRequestDto);
}
