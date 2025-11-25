package com.example.StockCoin.Controller;

import com.example.StockCoin.Entity.ChatMessageEntity;
import com.example.StockCoin.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;

    @GetMapping("/api/chat/messages")
    public List<ChatMessageEntity> getMessages() {
        return chatService.findAll();
    }
}
