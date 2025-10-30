package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.CreateActivityRequest;
import com.treffpunktprojectgroup.treffpunkt.dto.RequestRegister;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;

import java.util.List;

public interface UserService {
    boolean changePassword(Integer id, String oldPassword, String newPassword);
    User register(RequestRegister requestRegister);
    void createActivity(CreateActivityRequest createActivityRequest);
    List<ActivityResponse> getUserActivities(Integer userId);
}
