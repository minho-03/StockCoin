package com.example.StockCoin.Repository;

import com.example.StockCoin.Entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<ChatMessageEntity, Long> {

}
