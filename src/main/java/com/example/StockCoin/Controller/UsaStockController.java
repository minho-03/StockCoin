package com.example.StockCoin.Controller;

import com.example.StockCoin.Dto.UsaChartDto;
import com.example.StockCoin.Dto.UsaStockDto;
import com.example.StockCoin.Service.UsaStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usa")
@RequiredArgsConstructor
public class UsaStockController {

    private final UsaStockService service;

    @GetMapping("/list")
    public List<UsaStockDto> list() {
        return service.fetchUsaList();
    }

    @GetMapping("/detail/{symbol}")
    public UsaChartDto detail(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1m") String period
    ) {
        return service.fetchUsaDetail(symbol, period);
    }
}
