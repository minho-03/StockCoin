package com.example.StockCoin.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_message")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;  // 닉네임 or 익명
    private String message; // 메시지 내용

    private String timestamp; // 보낸 시간 (문자열로 저장)
}
