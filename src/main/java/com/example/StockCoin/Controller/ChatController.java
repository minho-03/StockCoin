package com.example.StockCoin.Controller;

import com.example.StockCoin.Dto.ChatMessage;
import com.example.StockCoin.Entity.User;
import com.example.StockCoin.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void send(ChatMessage message, SimpMessageHeaderAccessor headerAccessor) {

        // Interceptor에서 저장한 로그인 사용자 정보 가져오기
        User loginUser = (User) headerAccessor.getSessionAttributes().get("loginUser");

        // 로그인 안 했으면 메시지 무시
        if (loginUser == null) {
            return;
        }

        // 발신자 = 로그인 닉네임
        message.setSender(loginUser.getNickname());

        // 1) DB 저장
        chatService.save(message);

        // 2) 모든 구독자에게 전송
        messagingTemplate.convertAndSend("/topic/chat", message);
    }
}
