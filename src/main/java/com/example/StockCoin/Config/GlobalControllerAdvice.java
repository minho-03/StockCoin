package com.example.StockCoin.Config;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalControllerAdvice {

    private final HttpSession session;

    @ModelAttribute("loginUser")
    public Object addLoginUserToModel() {
        return session.getAttribute("loginUser"); // 로그인한 사용자 정보(dto)
    }
}
