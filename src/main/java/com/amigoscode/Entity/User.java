package com.amigoscode.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    private String email;

    @Column(nullable = false)
    private String password;

    private String role;

    private String fullName;
    private String phone;
    private String address;

    @Column(columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    // (Lưu ý: Nếu dùng @Data của Lombok thì nó tự sinh ra getUsername() và
    // getPassword() rồi,
    // fen không cần viết lại nữa, trừ khi tên biến của fen đặt khác).

    // 2. Tài khoản có bị hết hạn không? -> Trả về true (Không)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 3. Tài khoản có bị khóa không? -> Trả về true (Không)
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // 4. Mật khẩu có bị hết hạn không? -> Trả về true (Không)
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 5. Tài khoản có đang kích hoạt không? -> Trả về true (Có)
    @Override
    public boolean isEnabled() {
        return true;
    }

    @ManyToMany
    @JoinTable(
            name = "user_favorite_books",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    private List<Book> favoriteBooks = new ArrayList<>();

}
