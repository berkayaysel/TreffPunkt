package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.*;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    boolean changePassword(String email, String oldPassword, String newPassword);
    User register(RequestRegister requestRegister);
    void createActivity(CreateActivityRequest createActivityRequest, String email);
    List<ActivityResponse> getUserActivities(Integer userId);
    UserProfileResponse getUserProfileByEmail(String email);
    User updateUserProfile(String loggendInEmail, ProfileUpdateRequest request);
    String saveProfileImage(String email, MultipartFile file);
}
