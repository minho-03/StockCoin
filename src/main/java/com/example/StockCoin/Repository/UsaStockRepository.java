package com.example.StockCoin.Repository;

import com.example.StockCoin.Entity.UsaStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsaStockRepository extends JpaRepository<UsaStock, Long> {
    Optional<UsaStock> findBySymbol(String symbol);
}
