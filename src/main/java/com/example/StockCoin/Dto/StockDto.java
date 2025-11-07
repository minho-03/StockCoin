package com.example.StockCoin.Dto;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockDto {
    private String name;        // 종목명
    private String code;        // 종목코드
    private String price;       // 현재가
    private String changeRate;  // 등락률
    private String volume;      // 거래량
}
