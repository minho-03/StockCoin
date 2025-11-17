package com.example.StockCoin.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CoinService {

    private final RestTemplate restTemplate = new RestTemplate();

    // ✅ 전체 코인 목록 (KRW-마켓)
    public List<Map<String, Object>> getAllCoins() {
        // 1️⃣ 전체 마켓 리스트 가져오기
        List<Map<String, Object>> allMarkets = Arrays.asList(
                restTemplate.getForObject("https://api.upbit.com/v1/market/all?isDetails=false", Map[].class)
        );

        // 2️⃣ KRW 마켓만 필터링
        List<String> krwMarkets = allMarkets.stream()
                .map(m -> (String) m.get("market"))
                .filter(market -> market.startsWith("KRW-"))
                .collect(Collectors.toList());

        // 3️⃣ 각 마켓의 현재가 정보 가져오기
        String marketsParam = String.join(",", krwMarkets);
        List<Map<String, Object>> tickers = Arrays.asList(
                restTemplate.getForObject("https://api.upbit.com/v1/ticker?markets=" + marketsParam, Map[].class)
        );

        // 4️⃣ 데이터 가공
        return tickers.stream().map(t -> {
            Map<String, Object> coin = new HashMap<>();

            String code = (String) t.get("market");
            String name = code.replace("KRW-", "");

            double tradePrice = ((Number) t.get("trade_price")).doubleValue();
            double rate = ((Number) t.get("signed_change_rate")).doubleValue() * 100;
            double volume = ((Number) t.get("acc_trade_price_24h")).doubleValue();

            coin.put("code", code);
            coin.put("name", name);
            coin.put("price", String.format("%,.0f", tradePrice));
            coin.put("changeRate", String.format("%+.2f%%", rate));
            coin.put("volume", String.format("%,.0f", volume));

            return coin;
        }).collect(Collectors.toList());
    }

    // ✅ 업비트 캔들 데이터 (실제 차트용)
    public Map<String, Object> getCoinDetail(String code, String unit, int count) {
        String baseUrl;

        // 단위별 API 주소 결정
        switch (unit) {
            case "weeks":
                baseUrl = "https://api.upbit.com/v1/candles/weeks";
                break;
            case "months":
                baseUrl = "https://api.upbit.com/v1/candles/months";
                break;
            case "days":
            default:
                baseUrl = "https://api.upbit.com/v1/candles/days";
        }

        // ✅ 업비트 캔들 API 호출
        String url = baseUrl + "?market=" + code + "&count=" + count;
        List<Map<String, Object>> candles = Arrays.asList(
                restTemplate.getForObject(url, Map[].class)
        );

        // ✅ 데이터 가공 (최근 → 과거 순서이므로 뒤집기)
        Collections.reverse(candles);

        List<String> labels = new ArrayList<>();
        List<Double> prices = new ArrayList<>();
        List<Double> volumes = new ArrayList<>();

        for (Map<String, Object> candle : candles) {
            String date = ((String) candle.get("candle_date_time_kst")).substring(5, 10); // MM-DD 형식
            labels.add(date);
            prices.add(((Number) candle.get("trade_price")).doubleValue());
            volumes.add(((Number) candle.get("candle_acc_trade_price")).doubleValue());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("prices", prices);
        result.put("volumes", volumes);

        return result;
    }
}
