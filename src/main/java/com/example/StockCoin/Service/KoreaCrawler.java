package com.example.StockCoin.util;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Slf4j
@Component
public class KoreaCrawler {

    /**
     * ✅ 기본 버전 (기존 코드와 호환)
     * - 아무 기간도 지정하지 않으면 1개월치(기본값)
     */
    public Map<String, Object> fetchStockDetail(String code) {
        return fetchStockDetail(code, "1m");
    }

    /**
     * ✅ 기간별 버전 (1m, 3m, 6m)
     * - 네이버 금융 일별 시세 페이지를 여러 장 크롤링
     */
    public Map<String, Object> fetchStockDetail(String code, String period) {

        int pageCount;
        switch (period) {
            case "3m":  // 3개월
                pageCount = 10;
                break;
            case "6m":  // 6개월
                pageCount = 20;
                break;
            default:    // 1개월
                pageCount = 3;
        }

        List<String> labels = new ArrayList<>();
        List<Double> prices = new ArrayList<>();
        List<Long> volumes = new ArrayList<>();

        try {
            for (int i = 1; i <= pageCount; i++) {
                String url = "https://finance.naver.com/item/sise_day.nhn?code=" + code + "&page=" + i;
                Document doc = Jsoup.connect(url)
                        .userAgent("Mozilla/5.0")
                        .timeout(5000)
                        .get();

                Elements rows = doc.select("table.type2 tr");

                for (Element row : rows) {
                    Elements tds = row.select("td");
                    if (tds.size() < 7) continue;

                    String date = tds.get(0).text().trim();
                    String closeText = tds.get(1).text().replace(",", "").trim();
                    String volumeText = tds.get(6).text().replace(",", "").trim();

                    if (date.isEmpty() || closeText.isEmpty()) continue;

                    try {
                        double close = Double.parseDouble(closeText);
                        long volume = Long.parseLong(volumeText);
                        labels.add(date);
                        prices.add(close);
                        volumes.add(volume);
                    } catch (NumberFormatException e) {
                        log.warn("⚠️ 숫자 변환 실패: {}", closeText);
                    }
                }
            }
        } catch (IOException e) {
            log.error("❌ 네이버 금융 크롤링 실패 ({}): {}", code, e.getMessage());
        }

        // ✅ 최신 날짜가 오른쪽으로 오도록 뒤집기
        Collections.reverse(labels);
        Collections.reverse(prices);
        Collections.reverse(volumes);

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("prices", prices);
        result.put("volumes", volumes);
        result.put("period", period);

        log.info("✅ [{}] {} 데이터 수집 완료: {}건", code, period, labels.size());
        return result;
    }
}
