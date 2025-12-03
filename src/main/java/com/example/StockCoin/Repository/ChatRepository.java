package com.example.StockCoin.Repository;

import com.example.StockCoin.Entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<ChatMessageEntity, Long> {

    List<ChatMessageEntity> findTop3ByOrderByIdDesc();
}
