-- --------------------------------------------------------
-- Host:                         72.60.205.181
-- Server version:               10.11.13-MariaDB-0ubuntu0.24.04.1 - Ubuntu 24.04
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table garbhsarthi.app_user
CREATE TABLE IF NOT EXISTS `app_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Admin, 2 = Pregnant, 3 = TTC',
  `phone` varchar(20) DEFAULT NULL,
  `uid` varchar(255) NOT NULL,
  `active_profile_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `otp` varchar(50) DEFAULT NULL,
  `profile_url` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.community_post
CREATE TABLE IF NOT EXISTS `community_post` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(20) NOT NULL,
  `object_type` enum('image','video','text') NOT NULL,
  `object_url` text DEFAULT NULL,
  `message` text DEFAULT NULL,
  `poster_url` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_community_post_app_user` (`created_by`),
  CONSTRAINT `FK_community_post_app_user` FOREIGN KEY (`created_by`) REFERENCES `app_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.community_post_comment
CREATE TABLE IF NOT EXISTS `community_post_comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_community_post_comment_community_post` (`post_id`),
  KEY `FK_community_post_comment_app_user` (`user_id`),
  CONSTRAINT `FK_community_post_comment_app_user` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_community_post_comment_community_post` FOREIGN KEY (`post_id`) REFERENCES `community_post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.community_post_like
CREATE TABLE IF NOT EXISTS `community_post_like` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_id` (`post_id`,`user_id`),
  KEY `FK_community_post_like_app_user` (`user_id`),
  CONSTRAINT `FK_community_post_like_app_user` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_community_post_like_community_post` FOREIGN KEY (`post_id`) REFERENCES `community_post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.daily_task_progress
CREATE TABLE IF NOT EXISTS `daily_task_progress` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `task_date` date NOT NULL,
  `task` enum('YOGA','MEDITATION','SAMVAAD','AFFIRMATION','MANTRA','HYDRATION','MOOD') NOT NULL,
  `progress_percent` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `is_completed` tinyint(1) GENERATED ALWAYS AS (`progress_percent` = 100) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_day_task` (`user_id`,`task_date`,`task`),
  KEY `idx_user_day` (`user_id`,`task_date`),
  CONSTRAINT `FK_daily_task_progress_app_user` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `daily_task_progress_chk_1` CHECK (`progress_percent` <= 100)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.live_classes
CREATE TABLE IF NOT EXISTS `live_classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time DEFAULT NULL,
  `instructor_name` varchar(255) NOT NULL,
  `thumbnail_image` varchar(255) DEFAULT NULL,
  `action_type` enum('Join','Notify','Coming soon') NOT NULL DEFAULT 'Notify',
  `meeting_link` varchar(500) DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  `class_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `type` enum('Prenatal','Garbh','Postnatal','TTC') DEFAULT NULL,
  `trimester` int(11) DEFAULT NULL,
  `meeting_hash` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `trainer_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_live_classes_trainer` (`trainer_id`),
  CONSTRAINT `FK_live_classes_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `trainer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.profile
CREATE TABLE IF NOT EXISTS `profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL DEFAULT 0,
  `role` tinyint(4) NOT NULL COMMENT '2 = Pregnant Mom, 3 = TTC',
  `full_name` varchar(150) NOT NULL,
  `due_date` date DEFAULT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `first_pregnancy` tinyint(1) DEFAULT NULL,
  `last_period_date` date DEFAULT NULL,
  `cycle_length` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `period_length` int(11) DEFAULT NULL,
  `selected_live_class_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_profile_app_user` (`user_id`),
  CONSTRAINT `FK_profile_app_user` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.selected_live_class
CREATE TABLE IF NOT EXISTS `selected_live_class` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 0,
  `selected_live_class_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_selected_live_class_profile` (`profile_id`),
  KEY `FK_selected_live_class_app_user` (`created_by`),
  CONSTRAINT `FK_selected_live_class_app_user` FOREIGN KEY (`created_by`) REFERENCES `app_user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_selected_live_class_profile` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(255) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.subscription_plans
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(50) NOT NULL,
  `plan_description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `duration_days` int(11) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `plan_type` enum('STANDARD','PREMIUM') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.trainer
CREATE TABLE IF NOT EXISTS `trainer` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_trainer_phone` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.user_integration
CREATE TABLE IF NOT EXISTS `user_integration` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `provider` enum('google') NOT NULL DEFAULT 'google',
  `google_email` varchar(190) DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `refresh_token` text NOT NULL,
  `scope` text DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_provider` (`user_id`,`provider`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.user_subscriptions
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `payment_status` enum('Pending','Success','Failed') DEFAULT 'Pending',
  `start_date` timestamp NULL DEFAULT current_timestamp(),
  `end_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_user_subscription_user` (`user_id`),
  KEY `fk_user_subscription_plan` (`plan_id`),
  CONSTRAINT `FK_user_subscriptions_app_user` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_subscription_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table garbhsarthi.video_library
CREATE TABLE IF NOT EXISTS `video_library` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique video ID',
  `title` varchar(255) NOT NULL COMMENT 'Title of the video',
  `description` text DEFAULT NULL COMMENT 'Detailed description of the video',
  `video_url` varchar(500) DEFAULT NULL COMMENT 'URL of the video file',
  `thumbnail` varchar(500) DEFAULT NULL COMMENT 'Thumbnail image URL',
  `category` enum('Yoga & Fitness','Nutrition & Lifestyle','Garbh Sanskaar','Problem Solving','Mind-Body Wellness','Male Partner Wellness') NOT NULL COMMENT 'Category of the video',
  `role` enum('2','3') NOT NULL DEFAULT '2' COMMENT 'Role access: 2 = Women, 3 = Partner',
  `trimester` tinyint(4) DEFAULT NULL COMMENT 'Applicable trimester (1, 2, or 3). NULL = not trimester-specific',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Record creation time',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Record last update time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Video library storing prenatal and wellness content';

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
