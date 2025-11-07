package com.example.StockCoin.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

	@GetMapping("/")
	public String home() {
        return "home";
	}


	@GetMapping("priceStock")
	public String priceStock() {
		return "priceStock";
	}

	@GetMapping("priceCoin")
	public String priceCoin() {
		return "priceCoin";
	}

	@GetMapping("favorites")
	public String favorites() {
		return "favorites";
	}

	@GetMapping("chat")
	public String chat() {
		return "chat";
	}

	@GetMapping("login")
	public String login() {
		return "login";
	}

	@GetMapping("join")
	public String join() {
		return "join";
	}
}
