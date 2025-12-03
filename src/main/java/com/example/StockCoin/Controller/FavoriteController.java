package com.example.StockCoin.Controller;

import com.example.StockCoin.Dto.FavoriteDto;
import com.example.StockCoin.Entity.Favorite.FavoriteType;
import com.example.StockCoin.Service.FavoriteService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.StockCoin.Entity.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    // 관심종목 추가
    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody FavoriteDto.Request request, HttpSession session) {
        String username = getUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            FavoriteDto.Response response = favoriteService.addFavorite(username, request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("관심종목 추가에 실패했습니다."));
        }
    }

    // 관심종목 삭제 (ID로)
    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long favoriteId, HttpSession session) {
        String username = getUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            favoriteService.removeFavorite(username, favoriteId);
            return ResponseEntity.ok(createSuccessResponse("관심종목이 삭제되었습니다."));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("관심종목 삭제에 실패했습니다."));
        }
    }

    // 관심종목 삭제 (심볼과 타입으로)
    @DeleteMapping
    public ResponseEntity<?> removeFavoriteBySymbol(
            @RequestParam String symbol,
            @RequestParam FavoriteType type,
            HttpSession session) {
        String username = getUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            favoriteService.removeFavoriteBySymbol(username, symbol, type);
            return ResponseEntity.ok(createSuccessResponse("관심종목이 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("관심종목 삭제에 실패했습니다."));
        }
    }

    // 전체 관심종목 조회
    @GetMapping
    public ResponseEntity<?> getFavorites(HttpSession session) {
        String username = getUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            List<FavoriteDto.Response> favorites = favoriteService.getFavorites(username);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("관심종목 조회에 실패했습니다."));
        }
    }

    // 타입별 관심종목 조회 (주식만 or 코인만)
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getFavoritesByType(@PathVariable FavoriteType type, HttpSession session) {
        String username = getUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            List<FavoriteDto.Response> favorites = favoriteService.getFavoritesByType(username, type);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("관심종목 조회에 실패했습니다."));
        }
    }

    // 관심종목 등록 여부 확인
    @GetMapping("/check")
    public ResponseEntity<?> checkFavorite(
            @RequestParam String symbol,
            @RequestParam FavoriteType type,
            HttpSession session) {
        String username = getUsername(session);

        if (username == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("isFavorite", false);
            response.put("message", "로그인이 필요합니다.");
            return ResponseEntity.ok(response);
        }

        try {
            boolean isFavorite = favoriteService.isFavorite(username, symbol, type);
            Map<String, Object> response = new HashMap<>();
            response.put("isFavorite", isFavorite);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("확인에 실패했습니다."));
        }
    }

    // 세션에서 username 추출
    private String getUsername(HttpSession session) {
        User loginUser = (User) session.getAttribute("loginUser");
        return loginUser != null ? loginUser.getUsername() : null;
    }

    // 에러 응답 생성
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }

    // 성공 응답 생성
    private Map<String, String> createSuccessResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
}