# ── Stage 1: Build JAR ────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml trước để tận dụng Docker cache khi chỉ code thay đổi
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source code và build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Run JAR ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Chỉ copy file JAR từ stage build — image nhỏ hơn nhiều (~200MB vs ~600MB)
COPY --from=build /app/target/*.jar app.jar

# Koyeb sẽ inject PORT tự động qua env var
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
