package com.amigoscode.integration;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Verifies that Flyway can migrate a pre-existing (legacy) schema to the current version.
 * Uses its own isolated MySQL container so that the schema pre-seeding done here
 * does not pollute the shared container used by CriticalFlowsIntegrationTest.
 */
@Testcontainers
class LegacySchemaMigrationTest {

    @Container
    private static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.42")
            .withDatabaseName("legacy_test")
            .withUsername("test")
            .withPassword("test");

    @Test
    void migratesPreFlywaySchemaToCurrentVersion() throws Exception {
        try (Connection connection = MYSQL.createConnection("");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE users (id BIGINT NOT NULL AUTO_INCREMENT, PRIMARY KEY (id)) ENGINE=InnoDB");
            statement.execute("CREATE TABLE book (id BIGINT NOT NULL AUTO_INCREMENT, PRIMARY KEY (id)) ENGINE=InnoDB");
            statement.execute("""
                    CREATE TABLE orders (
                        id BIGINT NOT NULL AUTO_INCREMENT,
                        order_date DATETIME(6) NULL,
                        status VARCHAR(255) NULL,
                        total_amount DOUBLE NOT NULL,
                        user_id BIGINT NULL,
                        PRIMARY KEY (id)
                    ) ENGINE=InnoDB
                    """);
        }

        Flyway flyway = Flyway.configure()
                .dataSource(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword())
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("1")
                .load();

        // Assert at least 2 migrations ran — using >= avoids breakage when new migrations are added.
        assertThat(flyway.migrate().migrationsExecuted).isGreaterThanOrEqualTo(2);

        try (Connection connection = MYSQL.createConnection("");
             Statement statement = connection.createStatement()) {
            assertThat(columnExists(statement, "orders", "vnpay_txn_ref")).isTrue();
            assertThat(columnExists(statement, "orders", "payment_method")).isTrue();
            assertThat(columnExists(statement, "orders", "payment_status")).isTrue();
            assertThat(tableExists(statement, "refresh_tokens")).isTrue();
            assertThat(tableExists(statement, "user_favorite_books")).isTrue();
            assertThat(columnExists(statement, "user_favorite_books", "user_id")).isTrue();
            assertThat(columnExists(statement, "user_favorite_books", "book_id")).isTrue();
        }
    }

    private boolean columnExists(Statement statement, String table, String column) throws Exception {
        try (ResultSet result = statement.executeQuery("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = '%s'
                  AND column_name = '%s'
                """.formatted(table, column))) {
            result.next();
            return result.getInt(1) == 1;
        }
    }

    private boolean tableExists(Statement statement, String table) throws Exception {
        try (ResultSet result = statement.executeQuery("""
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                  AND table_name = '%s'
                """.formatted(table))) {
            result.next();
            return result.getInt(1) == 1;
        }
    }
}
