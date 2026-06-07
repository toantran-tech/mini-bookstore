package com.amigoscode;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Mini Bookstore API")
                        .description(
                                "RESTful API backend cho hệ thống bán sách trực tuyến.\n\n" +
                                "**Tính năng chính:**\n" +
                                "- Xác thực JWT + phân quyền RBAC (Admin/Member)\n" +
                                "- Quản lý sách, danh mục, đơn hàng\n" +
                                "- Tìm kiếm & lọc đa điều kiện với phân trang\n" +
                                "- Thống kê Top 10 sách bán chạy & xem nhiều nhất\n\n" +
                                "**Hướng dẫn test API cần xác thực:**\n" +
                                "1. Gọi `POST /api/auth/login` để lấy token\n" +
                                "2. Nhấn nút **Authorize** (🔒) ở góc phải\n" +
                                "3. Dán token vào ô `Value` rồi nhấn Authorize"
                        )
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Toan Tran")
                                .url("https://github.com/toantran00/mini-bookstore")
                        )
                )

                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(
                        new Components()
                                .addSecuritySchemes(securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                                .description("Dán JWT token vào đây (không cần thêm 'Bearer ')")
                                )
                );
    }
}

