package com.example.StockCoin.Controller;

import com.example.StockCoin.Entity.User;
import com.example.StockCoin.Service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 회원가입 페이지
    @GetMapping("/signup")
    public String signupPage() {
        return "signup";
    }

    // 회원가입 처리
    @PostMapping("/signup")
    public String signup(@RequestParam String username,
                         @RequestParam String password,
                         @RequestParam String nickname,
                         Model model) {

        boolean ok = userService.signup(username, password, nickname);

        if (!ok) {
            model.addAttribute("error", "이미 존재하는 아이디입니다.");
            return "signup";
        }

        return "redirect:/login";
    }

    // 로그인 페이지
    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    // 로그인 처리
    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        HttpSession session,
                        Model model) {

        User user = userService.login(username, password);

        if (user == null) {
            model.addAttribute("error", "아이디 또는 비밀번호가 잘못되었습니다.");
            return "login";
        }

        session.setAttribute("loginUser", user);
        return "redirect:/"; // 로그인 성공 → 홈으로 이동
    }

    // 로그아웃
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    @GetMapping("/user/current")
    @ResponseBody
    public Map<String, String> getCurrentUser(HttpSession session) {
        Map<String, String> result = new HashMap<>();

        User loginUser = (User) session.getAttribute("loginUser");

        if (loginUser != null) {
            result.put("nickname", loginUser.getNickname());
            result.put("username", loginUser.getUsername());
        } else {
            // 로그인 안 했을 때는 익명 반환
            result.put("nickname", "익명");
            result.put("username", "anonymous");
        }

        return result;
    }
}