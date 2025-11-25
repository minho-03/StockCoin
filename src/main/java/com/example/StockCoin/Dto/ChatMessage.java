package com.example.StockCoin.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String sender;   // 보낸 사람 닉네임
    private String message;  // 메시지 내용
}
