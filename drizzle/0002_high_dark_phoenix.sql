CREATE TABLE `activity_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text,
	`started_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`last_heartbeat_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ended_at` integer,
	`active_seconds` integer DEFAULT 0 NOT NULL,
	`was_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_sessions_auth_unique` ON `activity_sessions` (`auth_session_id`);--> statement-breakpoint
CREATE INDEX `activity_sessions_user_idx` ON `activity_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `activity_sessions_device_idx` ON `activity_sessions` (`device_id`);--> statement-breakpoint
CREATE INDEX `activity_sessions_started_idx` ON `activity_sessions` (`started_at`);--> statement-breakpoint
CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`device_key` text NOT NULL,
	`device_type` text DEFAULT 'unknown' NOT NULL,
	`browser` text DEFAULT '未知浏览器' NOT NULL,
	`os` text DEFAULT '未知系统' NOT NULL,
	`user_agent` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`first_seen_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`last_seen_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `devices_user_key_unique` ON `devices` (`user_id`,`device_key`);--> statement-breakpoint
CREATE INDEX `devices_user_idx` ON `devices` (`user_id`);--> statement-breakpoint
CREATE INDEX `devices_last_seen_idx` ON `devices` (`last_seen_at`);--> statement-breakpoint
CREATE TABLE `login_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`device_id` text,
	`account` text NOT NULL,
	`device_key` text DEFAULT 'unknown' NOT NULL,
	`success` integer NOT NULL,
	`ip` text DEFAULT '' NOT NULL,
	`country` text DEFAULT '' NOT NULL,
	`region` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '未知' NOT NULL,
	`user_agent` text DEFAULT '' NOT NULL,
	`occurred_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `login_events_user_idx` ON `login_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `login_events_device_idx` ON `login_events` (`device_id`);--> statement-breakpoint
CREATE INDEX `login_events_occurred_idx` ON `login_events` (`occurred_at`);--> statement-breakpoint
ALTER TABLE `auth_sessions` ADD `device_id` text;