-- Initial schema: users, sessions, and todos tables
-- Generated from server/database/schema.ts

CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `password_hash` text,
  `name` text,
  `apple_id` text,
  `is_admin` integer DEFAULT false,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_apple_id_unique` ON `users` (`apple_id`);

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `expires_at` integer NOT NULL,
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `todos` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `completed` integer DEFAULT false,
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `creator_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `puzzles` (
  `id` text PRIMARY KEY NOT NULL,
  `room_id` text NOT NULL REFERENCES `rooms`(`id`) ON DELETE CASCADE,
  `sequence_order` integer NOT NULL,
  `puzzle_type` text NOT NULL,
  `content` text NOT NULL,
  `secret_answer_hash` text NOT NULL,
  `hints` text,
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `game_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `room_id` text NOT NULL REFERENCES `rooms`(`id`) ON DELETE CASCADE,
  `player_name` text NOT NULL,
  `start_time` text NOT NULL,
  `end_time` text,
  `current_puzzle_id` text REFERENCES `puzzles`(`id`),
  `created_at` text NOT NULL
);
