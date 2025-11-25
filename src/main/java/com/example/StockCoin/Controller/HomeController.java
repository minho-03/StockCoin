package com.example.StockCoin.Controller;

import com.example.StockCoin.Entity.ChatMessageEntity;
import com.example.StockCoin.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final ChatService chatService;

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("latestChat", chatService.findLatest3());
        return "home";
    }
}
