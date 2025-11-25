package com.example.StockCoin.Service;

import com.example.StockCoin.Dto.ChatMessage;
import com.example.StockCoin.Entity.ChatMessageEntity;
import com.example.StockCoin.Repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;

    // 메시지 저장(DB)
    public void save(ChatMessage msg) {

        ChatMessageEntity entity = ChatMessageEntity.builder()
                .sender(msg.getSender())
                .message(msg.getMessage())
                .timestamp(now())
                .build();

        chatRepository.save(entity);
    }

    // 전체 메시지 조회
    public List<ChatMessageEntity> findAll() {
        return chatRepository.findAll();
    }

    // 현재 시각 문자열
    private String now() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
