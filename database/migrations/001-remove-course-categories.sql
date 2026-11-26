-- ============================================================================
--  MIGRATION 001  —  Remove course categories
-- ============================================================================
--  Drops the `course_categories` table and the `courses.category_id` column.
--  Courses are now browsed by search, level and delivery format instead of by
--  discipline, and the header dropdown lists individual courses.
--
--  Order matters: the foreign key has to go before the column, and the column
--  before the table it references.
--
--  Applied against the live database on 19 November 2026.
--  IRREVERSIBLE — take a mysqldump first if you have category data to keep.
-- ============================================================================

-- 1. Drop the foreign key that ties courses to categories.
ALTER TABLE `courses` DROP FOREIGN KEY `fk_course_category`;

-- 2. Drop its supporting index.
ALTER TABLE `courses` DROP INDEX `idx_course_category`;

-- 3. Drop the column.
ALTER TABLE `courses` DROP COLUMN `category_id`;

-- 4. Drop the table.
DROP TABLE IF EXISTS `course_categories`;

-- 5. Remove the homepage settings that drove the (now deleted) categories section.
DELETE FROM `settings` WHERE `setting_key` IN (
  'home_categories_eyebrow',
  'home_categories_title',
  'home_categories_text'
);
