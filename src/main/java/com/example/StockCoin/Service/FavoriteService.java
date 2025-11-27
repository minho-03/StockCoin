package com.example.StockCoin.Service;

import com.example.StockCoin.Dto.FavoriteDto;
import com.example.StockCoin.Entity.Favorite;
import com.example.StockCoin.Entity.Favorite.FavoriteType;
import com.example.StockCoin.Entity.User;
import com.example.StockCoin.Repository.FavoriteRepository;
import com.example.StockCoin.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @Transactional
    public FavoriteDto.Response addFavorite(String username, FavoriteDto.Request request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (favoriteRepository.existsByUserAndSymbolAndType(user, request.getSymbol(), request.getType())) {
            throw new IllegalStateException("이미 등록된 관심종목입니다.");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .symbol(request.getSymbol())
                .name(request.getName())
                .type(request.getType())
                .build();

        Favorite saved = favoriteRepository.save(favorite);

        return convertToDto(saved);
    }

    @Transactional
    public void removeFavorite(String username, Long favoriteId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Favorite favorite = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new IllegalArgumentException("관심종목을 찾을 수 없습니다."));

        if (!favorite.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("삭제 권한이 없습니다.");
        }

        favoriteRepository.delete(favorite);
    }

    @Transactional
    public void removeFavoriteBySymbol(String username, String symbol, FavoriteType type) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Favorite favorite = favoriteRepository.findByUserAndSymbolAndType(user, symbol, type)
                .orElseThrow(() -> new IllegalArgumentException("관심종목을 찾을 수 없습니다."));

        favoriteRepository.delete(favorite);
    }

    public List<FavoriteDto.Response> getFavorites(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Favorite> favorites = favoriteRepository.findByUserOrderByCreatedAtDesc(user);

        return favorites.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FavoriteDto.Response> getFavoritesByType(String username, FavoriteType type) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Favorite> favorites = favoriteRepository.findByUserAndTypeOrderByCreatedAtDesc(user, type);

        return favorites.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public boolean isFavorite(String username, String symbol, FavoriteType type) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return favoriteRepository.existsByUserAndSymbolAndType(user, symbol, type);
    }

    private FavoriteDto.Response convertToDto(Favorite favorite) {
        return FavoriteDto.Response.builder()
                .id(favorite.getId())
                .symbol(favorite.getSymbol())
                .name(favorite.getName())
                .type(favorite.getType())
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}