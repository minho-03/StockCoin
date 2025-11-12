package com.example.StockCoin.controller;

import com.example.StockCoin.service.KoreaDetailService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/korea/detail")
public class KoreaDetailController {

    private final KoreaDetailService koreaDetailService;

    public KoreaDetailController(KoreaDetailService koreaDetailService) {
        this.koreaDetailService = koreaDetailService;
    }

    // ✅ 기간별 조회 추가 (기본값: 1m)
    @GetMapping("/{code}")
    public Map<String, Object> getStockDetail(
            @PathVariable String code,
            @RequestParam(defaultValue = "1m") String period) {

        return koreaDetailService.getStockDetail(code, period);
    }
}
