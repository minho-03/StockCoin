package com.example.StockCoin.Controller;

import com.example.StockCoin.service.CoinService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coin")
public class CoinController {

    private final CoinService coinService;

    public CoinController(CoinService coinService) {
        this.coinService = coinService;
    }

    @GetMapping("/list")
    public List<Map<String, Object>> getCoinList() {
        return coinService.getAllCoins();
    }

    @GetMapping("/detail/{code}")
    public Map<String, Object> getCoinDetail(
            @PathVariable String code,
            @RequestParam(defaultValue = "days") String unit,
            @RequestParam(defaultValue = "30") int count
    ) {
        return coinService.getCoinDetail(code, unit, count);
    }
}
