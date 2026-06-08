package com.amigoscode.config;

import com.amigoscode.repository.BookRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ImageMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public ImageMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Only runs if image URLs are still the old openlibrary/archive.org URLs
        Integer oldCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM book WHERE image_url LIKE '%openlibrary%' OR image_url LIKE '%archive.org%' OR image_url LIKE '%media-amazon%'",
                Integer.class);

        if (oldCount == null || oldCount == 0) return;

        System.out.println("[ImageMigration] Found " + oldCount + " books with old image URLs. Updating to Unsplash CDN...");

        String[][] updates = {
                {"1", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=600&fit=crop&q=80"},
                {"2", "https://images.unsplash.com/photo-1547954575-855750c57bd3?w=400&h=600&fit=crop&q=80"},
                {"3", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&q=80"},
                {"4", "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop&q=80"},
                {"5", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&q=80"},
                {"6", "https://images.unsplash.com/photo-1529148482759-b35b25c5f217?w=400&h=600&fit=crop&q=80"},
                {"7", "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop&q=80"},
                {"8", "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400&h=600&fit=crop&q=80"},
                {"9", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop&q=80"},
                {"10", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop&q=80"},
                {"11", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&q=80"},
                {"12", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop&q=80"},
                {"13", "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400&h=600&fit=crop&q=80"},
                {"14", "https://images.unsplash.com/photo-1455885661740-29cbf08a42fa?w=400&h=600&fit=crop&q=80"},
                {"15", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop&q=80"},
                {"16", "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop&q=80"},
                {"17", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=600&fit=crop&q=80"},
        };

        for (String[] row : updates) {
            jdbcTemplate.update("UPDATE book SET image_url = ? WHERE id = ?", row[1], Long.parseLong(row[0]));
        }

        System.out.println("[ImageMigration] Done! Updated " + updates.length + " book images.");
    }
}
