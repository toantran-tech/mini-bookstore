-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: minibookstore
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `author` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `stock` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `image_urls` text,
  `sold_count` int NOT NULL DEFAULT '0',
  `view_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FKam9riv8y6rjwkua1gapdfew4j` (`category_id`),
  CONSTRAINT `FKam9riv8y6rjwkua1gapdfew4j` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book`
--

LOCK TABLES `book` WRITE;
/*!40000 ALTER TABLE `book` DISABLE KEYS */;
INSERT INTO `book` VALUES (1,'James Gosling',150000,48,'Java Core Căn Bản',1,'Bí kíp nguyên thủy từ cha đẻ của Java. Vừa được Admin update thêm ảnh bìa xịn xò!','https://m.media-amazon.com/images/I/51r2X3y9xNL._AC_UF1000,1000_QL80_.jpg',NULL,NULL,0,0),(2,'Craig Walls',250000,29,'Spring Boot Thực Chiến',1,NULL,NULL,NULL,NULL,0,0),(3,'Robert C. Martin',320000,25,'Clean Code',1,'Cuốn sách kinh điển về cách viết code sạch, dễ đọc và bảo trì. Bắt buộc phải đọc với mọi lập trình viên.','https://covers.openlibrary.org/b/id/8234650-L.jpg',NULL,'https://covers.openlibrary.org/b/id/8234650-L.jpg,https://covers.openlibrary.org/b/id/8234650-M.jpg,https://covers.openlibrary.org/b/id/10432254-L.jpg',128,0),(4,'David Thomas & Andrew Hunt',295000,18,'The Pragmatic Programmer',1,'Hướng dẫn thực tiễn giúp bạn trở thành lập trình viên chuyên nghiệp hơn mỗi ngày.','https://covers.openlibrary.org/b/id/8091016-L.jpg',NULL,NULL,95,0),(5,'Gang of Four',380000,12,'Design Patterns',1,'23 mẫu thiết kế phần mềm kinh điển giúp giải quyết các vấn đề lập trình phổ biến.','https://covers.openlibrary.org/b/id/8267657-L.jpg',NULL,NULL,74,0),(6,'Kyle Simpson',210000,30,'You Don\'t Know JS',1,'Đào sâu vào JavaScript từ core concepts đến những tính năng ít ai biết. Dành cho dev JS muốn thật sự hiểu ngôn ngữ này.','https://covers.openlibrary.org/b/id/12547227-L.jpg',NULL,NULL,210,0),(7,'Peter Thiel',199000,40,'Zero to One',2,'Bí quyết xây dựng startup tạo ra thứ hoàn toàn mới thay vì cạnh tranh trên thị trường đã có.','https://covers.openlibrary.org/b/id/7984916-L.jpg',NULL,NULL,185,0),(8,'Eric Ries',185000,35,'The Lean Startup',2,'Phương pháp khởi nghiệp tinh gọn, học hỏi nhanh và xây dựng sản phẩm mà khách hàng thật sự cần.','https://covers.openlibrary.org/b/id/8739161-L.jpg',NULL,NULL,142,0),(9,'Jim Collins',225000,20,'Good to Great',2,'Nghiên cứu về những công ty từ tốt trở thành vĩ đại và bí quyết duy trì sự thành công lâu dài.','https://covers.openlibrary.org/b/id/8739201-L.jpg',NULL,NULL,98,0),(10,'James Clear',179000,60,'Atomic Habits',3,'Hệ thống xây dựng thói quen tốt và loại bỏ thói quen xấu thông qua những thay đổi nhỏ nhưng đột phá.','https://covers.openlibrary.org/b/id/10432254-L.jpg',NULL,'https://covers.openlibrary.org/b/id/10432254-L.jpg,https://covers.openlibrary.org/b/id/10432254-M.jpg,https://covers.openlibrary.org/b/id/8739161-L.jpg',320,2),(11,'Carol S. Dweck',165000,44,'Mindset',3,'Khoa học về tư duy phát triển — tại sao cách chúng ta nhìn về năng lực của mình quyết định thành công.','https://covers.openlibrary.org/b/id/8739351-L.jpg',NULL,NULL,88,0),(12,'Eckhart Tolle',155000,30,'The Power of Now',3,'Hướng dẫn thực hành về chánh niệm và sức mạnh của hiện tại. Một trong những cuốn sách tâm linh bán chạy nhất mọi thời đại.','https://covers.openlibrary.org/b/id/8267001-L.jpg',NULL,NULL,65,0),(13,'Paulo Coelho',95000,80,'Nhà Giả Kim',4,'Hành trình của một cậu bé chăn cừu đi tìm kho báu và khám phá ra ý nghĩa cuộc sống. Tiểu thuyết triết lý bán chạy nhất mọi thời đại.','https://covers.openlibrary.org/b/id/8371784-L.jpg',NULL,'https://covers.openlibrary.org/b/id/8371784-L.jpg,https://covers.openlibrary.org/b/id/8371784-M.jpg,https://covers.openlibrary.org/b/id/8234985-L.jpg',267,2),(14,'Dale Carnegie',89000,100,'Đắc Nhân Tâm',4,'Nghệ thuật thu phục lòng người — cuốn sách self-help kinh điển nhất thế kỷ 20 với hàng triệu bản in toàn cầu.','https://covers.openlibrary.org/b/id/8234985-L.jpg',NULL,NULL,411,0),(15,'George Orwell',120000,50,'1984',4,'Dystopian kinh điển về một xã hội toàn trị nơi Big Brother kiểm soát mọi suy nghĩ và hành động của con người.','https://covers.openlibrary.org/b/id/8575708-L.jpg',NULL,NULL,156,0),(16,'Stephen Hawking',145000,22,'A Brief History of Time',5,'Lịch sử vũ trụ từ Big Bang đến lỗ đen — Stephen Hawking giải thích vật lý phức tạp theo cách mọi người đều hiểu được.','https://covers.openlibrary.org/b/id/8406786-L.jpg',NULL,NULL,43,0),(17,'Walter Isaacson',265000,15,'The Innovators',5,'Câu chuyện về những con người đã tạo ra cuộc cách mạng kỹ thuật số — từ Ada Lovelace đến Steve Jobs.','https://covers.openlibrary.org/b/id/8739401-L.jpg',NULL,NULL,37,0);
/*!40000 ALTER TABLE `book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Lập trình Backend'),(2,'Lập trình'),(3,'Kinh doanh & Khởi nghiệp'),(4,'Tâm lý & Kỹ năng sống'),(5,'Tiểu thuyết'),(6,'Khoa học & Công nghệ');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_detail`
--

DROP TABLE IF EXISTS `order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  `book_id` bigint DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3aceepmpjwpo8pdn7gmjdfckq` (`book_id`),
  KEY `FKrws2q0si6oyd6il8gqe2aennc` (`order_id`),
  CONSTRAINT `FK3aceepmpjwpo8pdn7gmjdfckq` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`),
  CONSTRAINT `FKrws2q0si6oyd6il8gqe2aennc` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_detail`
--

LOCK TABLES `order_detail` WRITE;
/*!40000 ALTER TABLE `order_detail` DISABLE KEYS */;
INSERT INTO `order_detail` VALUES (1,150000,2,1,1),(2,250000,1,2,1),(3,150000,0,1,2),(4,165000,1,11,3);
/*!40000 ALTER TABLE `order_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_date` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_amount` double NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'2026-05-27 12:23:08.872754','CONFIRMED',550000,1),(2,'2026-05-29 05:26:03.282944','Pending',0,4),(3,'2026-05-29 14:16:08.199835','Pending',165000,6);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'toan@hcmute.edu.vn','123456','ROLE_CUSTOMER','toantvc'),(3,'toan@hcmute.edu.vn','$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1ipc9WmAojtmacPm','ROLE_USER','toantvc1'),(4,NULL,'$2a$10$68T46Fq.ZSR31jkAMa3spuwUfUtPBQYO8l2OXdadhAnPPei5xWsR6','ROLE_USER','toantvc2'),(5,NULL,'$2a$10$slYQmyNdGzTn7ZLBDIbdBeedzbw9.9Q/hYqOQuB.Z.4F1lG2GzM9u','ROLE_ADMIN','toan_admin'),(6,NULL,'$2a$10$s2azvmIOPZ0bpXUVYMFPBehmdkh4tIZ/kx31U4UuA8IekRH8vpEYG','ROLE_ADMIN','toan_admin_1');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-30 16:30:49
