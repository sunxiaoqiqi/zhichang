CREATE TABLE `training_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_ids` text NOT NULL,
	`answered_question_ids` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `training_runs_user_idx` ON `training_runs` (`user_id`);--> statement-breakpoint
CREATE INDEX `training_runs_user_status_idx` ON `training_runs` (`user_id`,`status`);--> statement-breakpoint
ALTER TABLE `users` ADD `access_plan` text DEFAULT 'free' NOT NULL;