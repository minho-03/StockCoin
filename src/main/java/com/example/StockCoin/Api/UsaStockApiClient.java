package com.example.StockCoin.Api;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class UsaStockApiClient {

    @Value("${finnhub.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // ✔ 현재가, 전일가
    public Map<String, Object> getQuote(String symbol) {
        String url = "https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + apiKey;
        return restTemplate.getForObject(url, Map.class);
    }

    // ✔ 차트 데이터 (c: 종가 / v: 거래량)
    public Map<String, Object> getCandle(String symbol, String resolution, int count) {
        long now = System.currentTimeMillis() / 1000;
        long from = now - (long) count * 24 * 60 * 60;

        String url = String.format(
                "https://finnhub.io/api/v1/stock/candle?symbol=%s&resolution=%s&from=%d&to=%d&token=%s",
                symbol, resolution, from, now, apiKey
        );

        return restTemplate.getForObject(url, Map.class);
    }

}
