package com.example.StockCoin.Controller;

import com.example.StockCoin.Entity.ChatMessageEntity;
import com.example.StockCoin.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final ChatService chatService;

    @GetMapping("/")
    public String home(Model model) {
        // 채팅 데이터
        model.addAttribute("latestChat", chatService.findLatest3());

        // 주식/코인 데이터 가져오기
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 국내 주식 데이터
            List<Map<String, String>> stockList = restTemplate.exchange(
                    "http://localhost:2468/api/korea/list",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, String>>>() {}
            ).getBody();

            // 코인 데이터
            List<Map<String, String>> coinList = restTemplate.exchange(
                    "http://localhost:2468/api/coin/list",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, String>>>() {}
            ).getBody();

            // 주요 종목 추출 (삼성전자, 현대차)
            if (stockList != null && !stockList.isEmpty()) {
                Map<String, String> samsung = stockList.stream()
                        .filter(s -> "005930".equals(s.get("code")))
                        .findFirst()
                        .orElse(null);

                Map<String, String> hyundai = stockList.stream()
                        .filter(s -> "005380".equals(s.get("code")))
                        .findFirst()
                        .orElse(null);

                model.addAttribute("samsung", samsung);
                model.addAttribute("hyundai", hyundai);

                // 삼성전자 차트 데이터 가져오기
                if (samsung != null) {
                    try {
                        Map<String, Object> chartData = restTemplate.exchange(
                                "http://localhost:2468/api/korea/detail/005930?period=1m",
                                HttpMethod.GET,
                                null,
                                new ParameterizedTypeReference<Map<String, Object>>() {}
                        ).getBody();
                        model.addAttribute("stockChartData", chartData);
                    } catch (Exception e) {
                        System.err.println("주식 차트 데이터 로드 실패: " + e.getMessage());
                    }
                }
            }

            // 주요 코인 추출 (비트코인, 이더리움)
            if (coinList != null && !coinList.isEmpty()) {
                Map<String, String> bitcoin = coinList.stream()
                        .filter(c -> "KRW-BTC".equals(c.get("code")))
                        .findFirst()
                        .orElse(null);

                Map<String, String> ethereum = coinList.stream()
                        .filter(c -> "KRW-ETH".equals(c.get("code")))
                        .findFirst()
                        .orElse(null);

                model.addAttribute("bitcoin", bitcoin);
                model.addAttribute("ethereum", ethereum);

                // 비트코인 차트 데이터 가져오기
                if (bitcoin != null) {
                    try {
                        Map<String, Object> coinChartData = restTemplate.exchange(
                                "http://localhost:2468/api/coin/detail/KRW-BTC?unit=days&count=7",
                                HttpMethod.GET,
                                null,
                                new ParameterizedTypeReference<Map<String, Object>>() {}
                        ).getBody();
                        model.addAttribute("coinChartData", coinChartData);
                    } catch (Exception e) {
                        System.err.println("코인 차트 데이터 로드 실패: " + e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("데이터 로드 실패: " + e.getMessage());
        }

        return "home";
    }
}