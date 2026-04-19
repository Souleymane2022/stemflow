CREATE TABLE "activities" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"activity_type" text NOT NULL,
	"description" text NOT NULL,
	"metadata" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"category" text NOT NULL,
	"requirement" text NOT NULL,
	"xp_required" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"user_id" text NOT NULL,
	"author_name" text NOT NULL,
	"text" text NOT NULL,
	"parent_id" text,
	"likes" integer DEFAULT 0,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_likes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"video_url" text,
	"text_content" text,
	"image_url" text,
	"room_id" text,
	"room_name" text,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"xp_reward" integer DEFAULT 25,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar" text,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement_stats" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_stats" jsonb,
	"preferred_difficulty" text DEFAULT 'debutant',
	CONSTRAINT "engagement_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" varchar PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"mission_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"target_value" integer NOT NULL,
	"current_progress" integer DEFAULT 0,
	"xp_reward" integer NOT NULL,
	"frequency" text NOT NULL,
	"category" text,
	"completed" boolean DEFAULT false,
	"expires_at" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content_id" text NOT NULL,
	"answers" jsonb NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"completed_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_index" integer NOT NULL,
	"explanation" text,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"id" varchar PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"xp_in_room" integer DEFAULT 0,
	"joined_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_post_likes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_posts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"text" text NOT NULL,
	"likes" integer DEFAULT 0,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"member_count" integer DEFAULT 0,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"activation_code" text,
	"oauth_id" text,
	"oauth_provider" text,
	"profile_image_url" text,
	"preferred_language" text DEFAULT 'fr',
	"education_level" text,
	"interests" jsonb,
	"level" text DEFAULT 'curieux',
	"xp" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" text,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "video_engagements" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content_id" text NOT NULL,
	"watch_time_seconds" integer NOT NULL,
	"completion_percentage" integer NOT NULL,
	"liked" boolean DEFAULT false,
	"commented" boolean DEFAULT false,
	"saved" boolean DEFAULT false,
	"shared" boolean DEFAULT false,
	"rewatch_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "oauth_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "oauth_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");