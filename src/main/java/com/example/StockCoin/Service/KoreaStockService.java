package com.example.StockCoin.Service;

import com.example.StockCoin.Dto.StockDto;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class KoreaStockService {

    private static final String KOSPI_TOP_URL = "https://finance.naver.com/sise/nxt_sise_quant.naver";

    public List<StockDto> getKoreaTopStocks() {
        List<StockDto> stockList = new ArrayList<>();

        try {
            Document doc = Jsoup.connect(KOSPI_TOP_URL)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .timeout(5000)
                    .get();

            Elements rows = doc.select("table.type_2 tbody tr");

            for (Element row : rows) {
                Elements tds = row.select("td");
                if (tds.size() < 6) continue; // 빈 행 건너뛰기

                // ✅ 종목명
                Element nameEl = row.selectFirst("a.tltle");
                if (nameEl == null) continue;
                String name = nameEl.text().trim();

                // ✅ 현재가 (td[2])
                String price = tds.get(2).text().trim();

                // ✅ 등락률 (td[4])
                String rate = "-";
                if (tds.size() > 4) {
                    Element rateEl = tds.get(4).selectFirst(
                            "span.tah.p11.nv01, " +  // 하락
                                    "span.tah.p11.nv02, " +  // 상승
                                    "span.tah.p11.nv00, " +  // 보합
                                    "span.tah.p11.red01, " + // 상승 (색상표기)
                                    "span.tah.p11.blue01"    // 하락 (색상표기)
                    );
                    if (rateEl != null) rate = rateEl.text().trim();
                }

                // ✅ 거래량 (td[5])
                String volume = (tds.size() > 5) ? tds.get(5).text().trim() : "-";

                // ✅ 종목 코드
                String href = nameEl.attr("href");
                String code = href.contains("code=") ? href.split("code=")[1] : "-";

                // ✅ 결과 저장
                stockList.add(StockDto.builder()
                        .name(name)
                        .code(code)
                        .price(price)
                        .changeRate(rate)
                        .volume(volume)
                        .build());

                log.debug("📈 [{}] 현재가={} | 등락률={} | 거래량={}", name, price, rate, volume);
            }

            log.info("✅ 국내 주식 크롤링 완료: {}개 종목", stockList.size());

        } catch (IOException e) {
            log.error("❌ 크롤링 오류: {}", e.getMessage());
        }

        return stockList;
    }
}
