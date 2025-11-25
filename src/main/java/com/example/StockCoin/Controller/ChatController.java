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

        // Interceptor 에서 저장한 로그인 사용자 정보 가져오기
        User loginUser = (User) headerAccessor.getSessionAttributes().get("loginUser");

        if (loginUser != null)
            message.setSender(loginUser.getNickname());
        else
            message.setSender("익명");

        // 1) DB 저장
        chatService.save(message);

        // 2) 실시간 채팅방에 전송
        messagingTemplate.convertAndSend("/topic/chat", message);
    }
}
