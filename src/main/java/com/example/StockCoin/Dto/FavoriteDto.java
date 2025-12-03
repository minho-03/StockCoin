package com.example.StockCoin.Dto;

import com.example.StockCoin.Entity.Favorite.FavoriteType;
import lombok.*;

import java.time.LocalDateTime;

public class FavoriteDto {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String symbol;
        private String name;
        private FavoriteType type;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String symbol;
        private String name;
        private FavoriteType type;
        private LocalDateTime createdAt;
        private String currentPrice;
        private String changeRate;
    }
}