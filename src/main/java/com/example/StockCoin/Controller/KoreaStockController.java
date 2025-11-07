package com.example.StockCoin.Controller;

import com.example.StockCoin.Dto.StockDto;
import com.example.StockCoin.Service.KoreaStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/korea")
@RequiredArgsConstructor
public class KoreaStockController {

    private final KoreaStockService koreaStockService;

    @GetMapping("/list")
    public List<StockDto> getStockList() {
        return koreaStockService.getKoreaTopStocks(); // 🚀 거래상위 50개 자동 반환
    }
}
