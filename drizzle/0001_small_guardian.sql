CREATE TABLE `course_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_number` integer NOT NULL,
	`completed_steps` text DEFAULT '[]' NOT NULL,
	`unlocked_step` integer DEFAULT 0 NOT NULL,
	`finished` integer DEFAULT false NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_progress_user_lesson_unique` ON `course_progress` (`user_id`,`lesson_number`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favorites_user_question_unique` ON `favorites` (`user_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`primary_scene_id` text NOT NULL,
	`difficulty` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `questions_scene_idx` ON `questions` (`primary_scene_id`);--> statement-breakpoint
CREATE INDEX `questions_status_idx` ON `questions` (`status`);--> statement-breakpoint
CREATE TABLE `training_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`primary_scene_id` text NOT NULL,
	`correct` integer NOT NULL,
	`answer_payload` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `training_attempts_user_idx` ON `training_attempts` (`user_id`);--> statement-breakpoint
CREATE INDEX `training_attempts_question_idx` ON `training_attempts` (`question_id`);--> statement-breakpoint
CREATE TABLE `training_scenes` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_number` integer NOT NULL,
	`title` text NOT NULL,
	`phase` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `training_scenes_lesson_unique` ON `training_scenes` (`lesson_number`);