package com.example.StockCoin.Config;

import com.example.StockCoin.Entity.User;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler handler,
                                   Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servlet) {
            HttpSession session = servlet.getServletRequest().getSession(false);

            if (session != null) {
                User loginUser = (User) session.getAttribute("loginUser");

                // 🔒 로그인하지 않은 사용자는 WebSocket 연결 차단
                if (loginUser == null) {
                    return false;
                }

                attributes.put("loginUser", loginUser);
            } else {
                // 세션이 없으면 차단
                return false;
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler handler,
                               Exception ex) {}
}