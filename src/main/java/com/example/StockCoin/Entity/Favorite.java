package com.example.StockCoin.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "favorites",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "symbol", "type"}))
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String symbol;  // 종목 코드 (예: 005930, KRW-BTC)

    @Column(nullable = false)
    private String name;    // 종목명 (예: 삼성전자, 비트코인)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FavoriteType type;  // STOCK 또는 COIN

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum FavoriteType {
        STOCK,  // 주식
        USA_STOCK, // 해외주식
        COIN    // 코인
    }
}