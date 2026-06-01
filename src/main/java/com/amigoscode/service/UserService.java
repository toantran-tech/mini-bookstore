package com.amigoscode.service;

import com.amigoscode.dto.PasswordChangeRequest;
import com.amigoscode.dto.UserProfileDto;
import com.amigoscode.dto.UserUpdateRequest;

public interface UserService {
    UserProfileDto getUserProfile(String username);
    UserProfileDto updateUserProfile(String username, UserUpdateRequest request);
    void changePassword(String username, PasswordChangeRequest request);
}
