package com.amigoscode;

import com.amigoscode.Entity.User;
import com.amigoscode.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

@SpringBootTest
public class UpdateRoleTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void setAdminRole() {
        Optional<User> userOpt = userRepository.findByUsername("toan_admin_1");
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole("ROLE_ADMIN");
            userRepository.save(user);
            System.out.println("SUCCESS: Updated toan_admin_1 to ROLE_ADMIN");
        } else {
            System.out.println("ERROR: User not found");
        }
    }
}
