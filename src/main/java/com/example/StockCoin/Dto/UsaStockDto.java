package com.example.StockCoin.Dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UsaStockDto {
    private String name;      // AAPL (Apple)
    private String code;      // AAPL
    private String price;     // 182.55
    private String changeRate;// +1.25%
    private String volume;    // "-" (리스트에는 거래량 없음)
}
