USE `paypay_challenge`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` ENUM('admin', 'employee')  NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_role` (role),
  UNIQUE (email),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `performance_reviews`;
CREATE TABLE `performance_reviews` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `review_categories`;
CREATE TABLE `review_categories` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `performance_review_id` int(11) unsigned NULL,
  `description` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_performance_review_id` (performance_review_id),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `feedback_assignments`;
CREATE TABLE `feedback_assignments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `assigned_user_id` varchar(255) NOT NULL,
  `performance_review_id` int(11) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (user_id),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `submitted_by_user_id` varchar(255) NOT NULL,
  `feedback_for_user_id` varchar(255) NOT NULL,
  `performance_review_id` int(11) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_submitted_by_user_id` (submitted_by_user_id),
  INDEX `idx_feedback_for_user_id` (feedback_for_user_id),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `feedback_answers`;
CREATE TABLE `feedback_answers` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `feedback_id` int(11) unsigned NOT NULL,
  `review_category_id` int(11) unsigned NOT NULL,
  `rating` int(1) DEFAULT 0,
  `explanation` text NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_feedback_id` (feedback_id),
  INDEX `idx_feedback_id_review_category_id` (feedback_id, review_category_id),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
