package com.example.StockCoin.Service;

import com.example.StockCoin.Entity.User;
import com.example.StockCoin.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;

    public boolean signup(String username, String password, String nickname) {

        // 아이디 중복
        if (userRepository.findByUsername(username).isPresent()) {
            return false;
        }

        User user = User.builder()
                .username(username)
                .password(encoder.encode(password)) // 비번 암호화
                .nickname(nickname)
                .build();

        userRepository.save(user);
        return true;
    }

    public User login(String username, String password) {
        Optional<User> opt = userRepository.findByUsername(username);

        if (opt.isPresent()) {
            User user = opt.get();
            if (encoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        return null;
    }
}
