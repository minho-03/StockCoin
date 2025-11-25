package com.example.StockCoin.Dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsaChartDto {
    private List<String> labels;
    private List<Double> prices;
    private List<Double> volumes;
}
