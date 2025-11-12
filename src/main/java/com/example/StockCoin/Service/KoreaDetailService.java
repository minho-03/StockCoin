package com.example.StockCoin.service;

import com.example.StockCoin.util.KoreaCrawler;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class KoreaDetailService {

    private final KoreaCrawler koreaCrawler;

    public KoreaDetailService(KoreaCrawler koreaCrawler) {
        this.koreaCrawler = koreaCrawler;
    }

    // ✅ 기간별 데이터 요청 (기본 1개월)
    public Map<String, Object> getStockDetail(String code, String period) {
        return koreaCrawler.fetchStockDetail(code, period);
    }
}
