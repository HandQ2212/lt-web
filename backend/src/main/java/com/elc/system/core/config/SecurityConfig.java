package com.elc.system.core.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.elc.system.core.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Kích hoạt cấu hình CORS đã định nghĩa ở Bean bên dưới
                .cors(Customizer.withDefaults())
                
                // 2. Disable CSRF (vì chúng ta dùng JWT)
                .csrf(AbstractHttpConfigurer::disable)
                
                .authorizeHttpRequests(auth -> auth
                        // 3. Cho phép tất cả các request OPTIONS (Preflight) đi qua
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/leads").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/branches/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/levels/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payment/payos-webhook").permitAll()




                        // Error endpoint
                        .requestMatchers("/error").permitAll()

                         // Analytics endpoints should require MANAGER or ACCOUNTANT role
                         .requestMatchers("/api/analytics/**").hasAnyRole("MANAGER", "ACCOUNTANT")
                         // Admin endpoints should require authentication
                         .requestMatchers("/api/admin/**").authenticated()

                        // Các API khác yêu cầu đăng nhập
                        .requestMatchers("/api/**").authenticated()

                        // Mọi request khác bị từ chối
                        .anyRequest().denyAll())

                // 4. Add JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép các Origin (Frontend) được phép truy cập
        // Bạn có thể thêm port 3000 hoặc các port khác nếu cần
        configuration.setAllowedOriginPatterns(List.of(
            "https://elc.handq2212.site",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://26.150.15.154:*"
        ));
        // Cho phép các phương thức HTTP mà frontend gọi xuống backend
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Với các request phức tạp như POST, PUT, DELETE, hoặc request có header Authorization, trình duyệt thường gửi request OPTIONS trước.
        
        // Cho phép các Header cần thiết
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));//frontend được phép đọc những response header nào từ backend.
        
        // Cho phép gửi Credentials (Cookies, Auth Headers)
        configuration.setAllowCredentials(true);
        
        // Thời gian cache kết quả Preflight (giảm số lượng request OPTIONS)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // áp dụng cors cho tất cả endpoint
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
