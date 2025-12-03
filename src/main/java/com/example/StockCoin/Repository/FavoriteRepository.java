package com.example.StockCoin.Repository;

import com.example.StockCoin.Entity.Favorite;
import com.example.StockCoin.Entity.Favorite.FavoriteType;
import com.example.StockCoin.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    List<Favorite> findByUserAndTypeOrderByCreatedAtDesc(User user, FavoriteType type);

    boolean existsByUserAndSymbolAndType(User user, String symbol, FavoriteType type);

    Optional<Favorite> findByUserAndSymbolAndType(User user, String symbol, FavoriteType type);

    long countByUser(User user);
}