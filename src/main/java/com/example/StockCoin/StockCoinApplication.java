package com.example.StockCoin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class StockCoinApplication {

	public static void main(String[] args) {
		SpringApplication.run(StockCoinApplication.class, args);
	}

}
