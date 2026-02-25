CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`activity_type` text NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`category` text NOT NULL,
	`requirement` text NOT NULL,
	`xp_required` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `comment_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`user_id` text NOT NULL,
	`author_name` text NOT NULL,
	`text` text NOT NULL,
	`parent_id` text,
	`likes` integer DEFAULT 0,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contents` (
	`id` text PRIMARY KEY NOT NULL,
	`content_type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`video_url` text,
	`text_content` text,
	`image_url` text,
	`room_id` text,
	`room_name` text,
	`category` text NOT NULL,
	`difficulty` text NOT NULL,
	`tags` text DEFAULT '[]',
	`xp_reward` integer DEFAULT 25,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`author_avatar` text,
	`likes` integer DEFAULT 0,
	`comments` integer DEFAULT 0,
	`shares` integer DEFAULT 0,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `engagement_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_stats` text,
	`preferred_difficulty` text DEFAULT 'debutant'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `engagement_stats_user_id_unique` ON `engagement_stats` (`user_id`);--> statement-breakpoint
CREATE TABLE `follows` (
	`id` text PRIMARY KEY NOT NULL,
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`target_value` integer NOT NULL,
	`current_progress` integer DEFAULT 0,
	`xp_reward` integer NOT NULL,
	`frequency` text NOT NULL,
	`category` text,
	`completed` integer DEFAULT false,
	`expires_at` text
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`read` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used` integer DEFAULT false,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_tokens_token_unique` ON `password_reset_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content_id` text NOT NULL,
	`answers` text NOT NULL,
	`score` integer NOT NULL,
	`total_questions` integer NOT NULL,
	`completed_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`correct_option_index` integer NOT NULL,
	`explanation` text,
	`order` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `room_members` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`xp_in_room` integer DEFAULT 0,
	`joined_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `room_post_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `room_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`text` text NOT NULL,
	`likes` integer DEFAULT 0,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`image_url` text,
	`member_count` integer DEFAULT 0,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`badge_id` text NOT NULL,
	`earned_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`is_active` integer DEFAULT false,
	`activation_code` text,
	`oauth_id` text,
	`oauth_provider` text,
	`profile_image_url` text,
	`preferred_language` text DEFAULT 'fr',
	`education_level` text,
	`interests` text,
	`level` text DEFAULT 'curieux',
	`xp` integer DEFAULT 0,
	`streak` integer DEFAULT 0,
	`onboarding_completed` integer DEFAULT false,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `video_engagements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content_id` text NOT NULL,
	`watch_time_seconds` integer NOT NULL,
	`completion_percentage` integer NOT NULL,
	`liked` integer DEFAULT false,
	`commented` integer DEFAULT false,
	`saved` integer DEFAULT false,
	`shared` integer DEFAULT false,
	`rewatch_count` integer DEFAULT 0
);
