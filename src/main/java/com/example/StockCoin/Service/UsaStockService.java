package com.example.StockCoin.Service;

import com.example.StockCoin.Api.UsaStockApiClient;
import com.example.StockCoin.Dto.UsaChartDto;
import com.example.StockCoin.Dto.UsaStockDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UsaStockService {

    private final UsaStockApiClient api;

    // ✔ 회사명 매핑
    private static final Map<String, String> COMPANY_NAMES = Map.ofEntries(
            Map.entry("AAPL", "Apple"),
            Map.entry("MSFT", "Microsoft"),
            Map.entry("GOOG", "Alphabet"),
            Map.entry("META", "Meta"),
            Map.entry("AMZN", "Amazon"),
            Map.entry("TSLA", "Tesla"),
            Map.entry("NVDA", "NVIDIA"),
            Map.entry("AMD", "AMD"),
            Map.entry("INTC", "Intel"),
            Map.entry("JPM", "JPMorgan"),
            Map.entry("BAC", "Bank of America"),
            Map.entry("V", "Visa"),
            Map.entry("MA", "Mastercard"),
            Map.entry("BA", "Boeing"),
            Map.entry("CAT", "Caterpillar"),
            Map.entry("WMT", "Walmart"),
            Map.entry("NKE", "Nike"),
            Map.entry("PG", "Procter & Gamble"),
            Map.entry("KO", "Coca-Cola"),
            Map.entry("PEP", "PepsiCo"),
            Map.entry("PFE", "Pfizer"),
            Map.entry("JNJ", "Johnson & Johnson"),
            Map.entry("VZ", "Verizon"),
            Map.entry("DIS", "Disney"),
            Map.entry("NFLX", "Netflix")
    );

    private final List<String> symbols = new ArrayList<>(COMPANY_NAMES.keySet());

    // ------------------------------------
    // ✔ 리스트 (현재가 + 등락률)
    // ------------------------------------
    public List<UsaStockDto> fetchUsaList() {

        List<UsaStockDto> list = new ArrayList<>();

        for (String code : symbols) {
            try {
                Map<String, Object> q = api.getQuote(code);

                if (q == null || q.get("c") == null) continue;

                double price = toDouble(q.get("c"));
                double prev = toDouble(q.get("pc"));
                double rate = prev == 0 ? 0 : ((price - prev) / prev) * 100;

                String display = code + " (" + COMPANY_NAMES.get(code) + ")";

                list.add(UsaStockDto.builder()
                        .name(display)
                        .code(code)
                        .price(String.format("%,.2f", price))
                        .changeRate(String.format("%+.2f%%", rate))
                        .volume("-")
                        .build());

            } catch (Exception e) {
                System.out.println("❌ 리스트 오류: " + code);
            }
        }

        return list;
    }

    private double toDouble(Object v) {
        try {
            return Double.parseDouble(v.toString());
        } catch (Exception e) {
            return 0;
        }
    }

    // ------------------------------------
    // ✔ 차트 API
    // ------------------------------------
    public UsaChartDto fetchUsaDetail(String symbol, String period) {

        int count = switch (period) {
            case "3m" -> 90;
            case "6m" -> 180;
            default -> 30;
        };

        Map<String, Object> candle = api.getCandle(symbol, "D", count);

        System.out.println("📡 Candle Request Symbol = " + symbol + ", Period=" + period);
        System.out.println("🔥 Candle API 응답 = " + candle);

        if (candle == null) {
            System.out.println("❌ Candle 응답이 null 입니다!");
            return noData();
        }

        if (candle.containsKey("error")) {
            System.out.println("❌ Finnhub 오류 발생: " + candle.get("error"));
            return noData();
        }

        if (!"ok".equals(candle.get("s"))) {
            System.out.println("❌ Finnhub s 필드가 ok가 아님: " + candle);
            return noData();
        }

        List<Double> prices = (List<Double>) candle.getOrDefault("c", List.of());
        List<Double> volumes = (List<Double>) candle.getOrDefault("v", List.of());
        List<Long> timestamps = (List<Long>) candle.getOrDefault("t", List.of());

        if (prices.isEmpty() || timestamps.isEmpty()) {
            System.out.println("❌ Candle 데이터 비어 있음");
            return noData();
        }

        List<String> labels = new ArrayList<>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

        for (Long ts : timestamps) {
            labels.add(sdf.format(new Date(ts * 1000)));
        }

        return UsaChartDto.builder()
                .labels(labels)
                .prices(prices)
                .volumes(volumes)
                .build();
    }


    private UsaChartDto noData() {
        return UsaChartDto.builder()
                .labels(List.of("데이터 없음"))
                .prices(List.of(0.0))
                .volumes(List.of(0.0))
                .build();
    }
}
