    package com.example.StockCoin.Entity;

    import jakarta.persistence.*;
    import lombok.*;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @Table(name = "users")
    public class User {

        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, unique = true)
        private String username;   // 아이디

        @Column(nullable = false)
        private String password;   // 암호화된 비밀번호

        @Column(nullable = false)
        private String nickname;
    }
