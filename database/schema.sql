-- ============================================================================
--  COURSE ENQUIRY PLATFORM  --  DATABASE SCHEMA
--  Engine : InnoDB            Charset : utf8mb4 / utf8mb4_unicode_ci
--  Target : MariaDB 10.4+ (XAMPP)  and  MySQL 5.7 / 8.x (cPanel)  compatible
--  NOTE   : No MySQL-8-only syntax is used, so the same file imports on both.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 1. ADMIN USERS  (dashboard login)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(120)  NOT NULL,
  `email`         VARCHAR(190)  NOT NULL,
  `password_hash` VARCHAR(255)  NOT NULL,
  `role`          ENUM('super_admin','admin','editor') NOT NULL DEFAULT 'admin',
  `avatar`        VARCHAR(500)  DEFAULT NULL,
  `phone`         VARCHAR(40)   DEFAULT NULL,
  `is_active`     TINYINT(1)    NOT NULL DEFAULT 1,
  `last_login_at` DATETIME      DEFAULT NULL,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_email` (`email`),
  KEY `idx_admin_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. MEDIA LIBRARY  (driver-agnostic: disk path OR MySQL blob OR remote URL)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `media` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filename`       VARCHAR(255) NOT NULL,
  `original_name`  VARCHAR(255) NOT NULL,
  `mime_type`      VARCHAR(100) NOT NULL,
  `file_size`      INT UNSIGNED NOT NULL DEFAULT 0,
  `width`          INT UNSIGNED DEFAULT NULL,
  `height`         INT UNSIGNED DEFAULT NULL,
  `storage_driver` ENUM('local','db','remote') NOT NULL DEFAULT 'local',
  `url`            VARCHAR(600) NOT NULL,
  `file_data`      LONGBLOB     DEFAULT NULL,
  `alt_text`       VARCHAR(255) DEFAULT NULL,
  `folder`         VARCHAR(80)  NOT NULL DEFAULT 'general',
  `uploaded_by`    INT UNSIGNED DEFAULT NULL,
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_folder` (`folder`),
  KEY `idx_media_created` (`created_at`),
  CONSTRAINT `fk_media_user` FOREIGN KEY (`uploaded_by`)
    REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. COURSES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courses` (
  `id`                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`                VARCHAR(200)  NOT NULL,
  `slug`                 VARCHAR(220)  NOT NULL,
  `code`                 VARCHAR(40)   DEFAULT NULL,
  `short_description`    VARCHAR(500)  DEFAULT NULL,
  `overview`             LONGTEXT      DEFAULT NULL,
  `who_should_attend`    TEXT          DEFAULT NULL,
  `eligibility`          TEXT          DEFAULT NULL,
  `career_opportunities` TEXT          DEFAULT NULL,
  `certification`        VARCHAR(255)  DEFAULT NULL,
  `thumbnail`            VARCHAR(600)  DEFAULT NULL,
  `banner_image`         VARCHAR(600)  DEFAULT NULL,
  `duration`             VARCHAR(80)   DEFAULT NULL,
  `duration_weeks`       SMALLINT UNSIGNED DEFAULT NULL,
  `lessons_count`        SMALLINT UNSIGNED DEFAULT NULL,
  `level`                ENUM('Beginner','Intermediate','Advanced','All Levels') NOT NULL DEFAULT 'All Levels',
  `delivery_mode`        ENUM('Online','Classroom','Hybrid','Self Paced') NOT NULL DEFAULT 'Online',
  `language`             VARCHAR(80)   NOT NULL DEFAULT 'English',
  `fee_text`             VARCHAR(120)  DEFAULT NULL,
  `price`                DECIMAL(10,2) DEFAULT NULL,
  `discount_price`       DECIMAL(10,2) DEFAULT NULL,
  `rating`               DECIMAL(2,1)  NOT NULL DEFAULT 4.8,
  `reviews_count`        INT UNSIGNED  NOT NULL DEFAULT 0,
  `students_enrolled`    INT UNSIGNED  NOT NULL DEFAULT 0,
  `is_featured`          TINYINT(1)    NOT NULL DEFAULT 0,
  `is_popular`           TINYINT(1)    NOT NULL DEFAULT 0,
  `is_active`            TINYINT(1)    NOT NULL DEFAULT 1,
  `display_order`        SMALLINT      NOT NULL DEFAULT 0,
  `views`                INT UNSIGNED  NOT NULL DEFAULT 0,
  `enquiry_count`        INT UNSIGNED  NOT NULL DEFAULT 0,
  `meta_title`           VARCHAR(255)  DEFAULT NULL,
  `meta_description`     VARCHAR(500)  DEFAULT NULL,
  `meta_keywords`        VARCHAR(500)  DEFAULT NULL,
  `created_at`           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_course_slug` (`slug`),
  KEY `idx_course_active_order` (`is_active`,`display_order`),
  KEY `idx_course_featured` (`is_featured`,`is_active`),
  KEY `idx_course_popular` (`is_popular`,`is_active`),
  KEY `idx_course_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. COURSE -> LEARNING OUTCOMES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course_outcomes` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id`     INT UNSIGNED NOT NULL,
  `outcome`       VARCHAR(400) NOT NULL,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_outcome_course` (`course_id`,`display_order`),
  CONSTRAINT `fk_outcome_course` FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. COURSE -> SYLLABUS / CURRICULUM MODULES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course_syllabus` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id`     INT UNSIGNED NOT NULL,
  `module_title`  VARCHAR(250) NOT NULL,
  `description`   TEXT         DEFAULT NULL,
  `topics`        TEXT         DEFAULT NULL,
  `duration`      VARCHAR(80)  DEFAULT NULL,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_syllabus_course` (`course_id`,`display_order`),
  CONSTRAINT `fk_syllabus_course` FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. COURSE -> HIGHLIGHTS / KEY FEATURES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course_highlights` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id`     INT UNSIGNED NOT NULL,
  `icon`          VARCHAR(60)  NOT NULL DEFAULT 'Sparkles',
  `title`         VARCHAR(200) NOT NULL,
  `description`   VARCHAR(400) DEFAULT NULL,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_highlight_course` (`course_id`,`display_order`),
  CONSTRAINT `fk_highlight_course` FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. COURSE -> FAQs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course_faqs` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id`     INT UNSIGNED NOT NULL,
  `question`      VARCHAR(400) NOT NULL,
  `answer`        TEXT         NOT NULL,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_coursefaq_course` (`course_id`,`display_order`),
  CONSTRAINT `fk_coursefaq_course` FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8. HERO SLIDES  (homepage full-screen slider)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id`                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `eyebrow`             VARCHAR(120) DEFAULT NULL,
  `title`               VARCHAR(220) NOT NULL,
  `highlight`           VARCHAR(120) DEFAULT NULL,
  `description`         VARCHAR(600) DEFAULT NULL,
  `image`               VARCHAR(600) NOT NULL,
  `mobile_image`        VARCHAR(600) DEFAULT NULL,
  `overlay_opacity`     TINYINT UNSIGNED NOT NULL DEFAULT 65,
  `text_align`          ENUM('left','center','right') NOT NULL DEFAULT 'left',
  `primary_btn_text`    VARCHAR(80)  DEFAULT 'Explore Courses',
  `primary_btn_link`    VARCHAR(300) DEFAULT '/courses',
  `secondary_btn_text`  VARCHAR(80)  DEFAULT 'Enquire Now',
  `secondary_btn_link`  VARCHAR(300) DEFAULT '/contact',
  `display_order`       SMALLINT     NOT NULL DEFAULT 0,
  `is_active`           TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slide_active_order` (`is_active`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. TESTIMONIALS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(140) NOT NULL,
  `designation`   VARCHAR(180) DEFAULT NULL,
  `organisation`  VARCHAR(180) DEFAULT NULL,
  `course_id`     INT UNSIGNED DEFAULT NULL,
  `course_label`  VARCHAR(200) DEFAULT NULL,
  `message`       TEXT         NOT NULL,
  `avatar`        VARCHAR(600) DEFAULT NULL,
  `rating`        TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `is_featured`   TINYINT(1)   NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_testimonial_active_order` (`is_active`,`display_order`),
  CONSTRAINT `fk_testimonial_course` FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 10. CMS PAGES  (About, Privacy, Terms + any custom page)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pages` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`            VARCHAR(200) NOT NULL,
  `slug`             VARCHAR(220) NOT NULL,
  `subtitle`         VARCHAR(400) DEFAULT NULL,
  `content`          LONGTEXT     DEFAULT NULL,
  `banner_image`     VARCHAR(600) DEFAULT NULL,
  `page_type`        ENUM('system','custom') NOT NULL DEFAULT 'custom',
  `show_in_header`   TINYINT(1)   NOT NULL DEFAULT 0,
  `show_in_footer`   TINYINT(1)   NOT NULL DEFAULT 1,
  `display_order`    SMALLINT     NOT NULL DEFAULT 0,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `meta_title`       VARCHAR(255) DEFAULT NULL,
  `meta_description` VARCHAR(500) DEFAULT NULL,
  `meta_keywords`    VARCHAR(500) DEFAULT NULL,
  `created_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_page_slug` (`slug`),
  KEY `idx_page_active` (`is_active`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 11. SETTINGS  (branding, contact, social, SEO, homepage copy, toggles)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_group`  VARCHAR(60)  NOT NULL DEFAULT 'general',
  `setting_key`    VARCHAR(100) NOT NULL,
  `setting_value`  LONGTEXT     DEFAULT NULL,
  `setting_type`   ENUM('text','textarea','richtext','image','color','number','boolean','select','json','email','url','tel') NOT NULL DEFAULT 'text',
  `label`          VARCHAR(180) NOT NULL,
  `description`    VARCHAR(400) DEFAULT NULL,
  `options`        VARCHAR(600) DEFAULT NULL,
  `display_order`  SMALLINT     NOT NULL DEFAULT 0,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_setting_key` (`setting_key`),
  KEY `idx_setting_group` (`setting_group`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 12. ENQUIRIES  (primary lead table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference`      VARCHAR(24)  NOT NULL,
  `name`           VARCHAR(140) NOT NULL,
  `email`          VARCHAR(190) NOT NULL,
  `phone`          VARCHAR(40)  NOT NULL,
  `city`           VARCHAR(120) DEFAULT NULL,
  `qualification`  VARCHAR(160) DEFAULT NULL,
  `preferred_mode` ENUM('Online','Classroom','Hybrid','No Preference') NOT NULL DEFAULT 'No Preference',
  `preferred_time` VARCHAR(120) DEFAULT NULL,
  `message`        TEXT         DEFAULT NULL,
  `source_page`    VARCHAR(300) DEFAULT NULL,
  `status`         ENUM('new','contacted','follow_up','converted','closed','spam') NOT NULL DEFAULT 'new',
  `priority`       ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  `admin_notes`    TEXT         DEFAULT NULL,
  `assigned_to`    INT UNSIGNED DEFAULT NULL,
  `is_read`        TINYINT(1)   NOT NULL DEFAULT 0,
  `ip_address`     VARCHAR(60)  DEFAULT NULL,
  `user_agent`     VARCHAR(400) DEFAULT NULL,
  `follow_up_at`   DATETIME     DEFAULT NULL,
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enquiry_reference` (`reference`),
  KEY `idx_enquiry_status` (`status`,`created_at`),
  KEY `idx_enquiry_read` (`is_read`),
  KEY `idx_enquiry_created` (`created_at`),
  KEY `idx_enquiry_email` (`email`),
  CONSTRAINT `fk_enquiry_assignee` FOREIGN KEY (`assigned_to`)
    REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 13. ENQUIRY <-> COURSES  (multiple course selection per enquiry)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enquiry_courses` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `enquiry_id`   INT UNSIGNED NOT NULL,
  `course_id`    INT UNSIGNED DEFAULT NULL,
  `course_title` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_eq_enquiry` (`enquiry_id`),
  KEY `idx_eq_course` (`course_id`),
  CONSTRAINT `fk_eq_enquiry` FOREIGN KEY (`enquiry_id`)
    REFERENCES `enquiries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_eq_course` FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 14. CONTACT MESSAGES  (Contact Us form)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(140) NOT NULL,
  `email`       VARCHAR(190) NOT NULL,
  `phone`       VARCHAR(40)  DEFAULT NULL,
  `subject`     VARCHAR(250) DEFAULT NULL,
  `message`     TEXT         NOT NULL,
  `status`      ENUM('new','read','replied','archived','spam') NOT NULL DEFAULT 'new',
  `admin_notes` TEXT         DEFAULT NULL,
  `ip_address`  VARCHAR(60)  DEFAULT NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_status` (`status`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 15. SITE FAQs  (global FAQ page + homepage FAQ section)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faqs` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question`      VARCHAR(400) NOT NULL,
  `answer`        TEXT         NOT NULL,
  `category`      VARCHAR(100) NOT NULL DEFAULT 'General',
  `show_on_home`  TINYINT(1)   NOT NULL DEFAULT 0,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_faq_active_order` (`is_active`,`display_order`),
  KEY `idx_faq_home` (`show_on_home`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 16. SITE FEATURES  ("Why learn with us" benefit cards)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_features` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `icon`          VARCHAR(60)  NOT NULL DEFAULT 'Sparkles',
  `title`         VARCHAR(200) NOT NULL,
  `description`   VARCHAR(600) DEFAULT NULL,
  `accent`        VARCHAR(20)  NOT NULL DEFAULT '#2563eb',
  `placement`     ENUM('home','about','both') NOT NULL DEFAULT 'both',
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_feature_active_order` (`is_active`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 17. SITE STATS  (animated counters)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_stats` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `icon`          VARCHAR(60)  NOT NULL DEFAULT 'TrendingUp',
  `label`         VARCHAR(160) NOT NULL,
  `value`         INT UNSIGNED NOT NULL DEFAULT 0,
  `suffix`        VARCHAR(20)  DEFAULT NULL,
  `prefix`        VARCHAR(20)  DEFAULT NULL,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_stat_active_order` (`is_active`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 18. LEARNING PROCESS STEPS  ("How it works")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `learning_steps` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `step_label`    VARCHAR(20)  NOT NULL DEFAULT '01',
  `icon`          VARCHAR(60)  NOT NULL DEFAULT 'Search',
  `title`         VARCHAR(200) NOT NULL,
  `description`   VARCHAR(600) DEFAULT NULL,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_step_active_order` (`is_active`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 19. TRAINERS / FACULTY  (About page)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trainers` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`             VARCHAR(140) NOT NULL,
  `designation`      VARCHAR(180) DEFAULT NULL,
  `bio`              TEXT         DEFAULT NULL,
  `photo`            VARCHAR(600) DEFAULT NULL,
  `expertise`        VARCHAR(400) DEFAULT NULL,
  `experience_years` TINYINT UNSIGNED DEFAULT NULL,
  `linkedin_url`     VARCHAR(400) DEFAULT NULL,
  `twitter_url`      VARCHAR(400) DEFAULT NULL,
  `email`            VARCHAR(190) DEFAULT NULL,
  `display_order`    SMALLINT     NOT NULL DEFAULT 0,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trainer_active_order` (`is_active`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 20. NAVIGATION MENU  (admin-controlled header / footer links)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `location`      ENUM('header','footer_primary','footer_secondary') NOT NULL DEFAULT 'header',
  `label`         VARCHAR(120) NOT NULL,
  `url`           VARCHAR(400) NOT NULL,
  `parent_id`     INT UNSIGNED DEFAULT NULL,
  `open_new_tab`  TINYINT(1)   NOT NULL DEFAULT 0,
  `display_order` SMALLINT     NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_menu_location` (`location`,`is_active`,`display_order`),
  KEY `idx_menu_parent` (`parent_id`),
  CONSTRAINT `fk_menu_parent` FOREIGN KEY (`parent_id`)
    REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 21. ACTIVITY LOG  (admin audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_log` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_user_id` INT UNSIGNED DEFAULT NULL,
  `actor_name`    VARCHAR(120) DEFAULT NULL,
  `action`        VARCHAR(60)  NOT NULL,
  `entity_type`   VARCHAR(60)  DEFAULT NULL,
  `entity_id`     INT UNSIGNED DEFAULT NULL,
  `description`   VARCHAR(500) DEFAULT NULL,
  `ip_address`    VARCHAR(60)  DEFAULT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_created` (`created_at`),
  KEY `idx_log_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`admin_user_id`)
    REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 22. PAGE VIEW ANALYTICS  (lightweight, for dashboard charts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `page_views` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `path`       VARCHAR(300) NOT NULL,
  `course_id`  INT UNSIGNED DEFAULT NULL,
  `referrer`   VARCHAR(400) DEFAULT NULL,
  `viewed_on`  DATE         NOT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_view_date` (`viewed_on`),
  KEY `idx_view_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
