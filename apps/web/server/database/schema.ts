/**
 * App-specific database schema.
 *
 * Re-exports the layer's base tables (users, sessions, todos) so that
 * drizzle-kit can discover them. EnigmaBox adds rooms, puzzles, game_sessions.
 */
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from '#layer/server/database/schema'

export * from '#layer/server/database/schema'

// ─── Rooms (escape rooms created by users) ───────────────────
export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  creatorId: text('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Puzzles (belong to a room, ordered by sequence) ─────────
export const puzzles = sqliteTable('puzzles', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  sequenceOrder: integer('sequence_order').notNull(),
  puzzleType: text('puzzle_type', { enum: ['text', 'code', 'image'] }).notNull(),
  content: text('content').notNull(),
  secretAnswerHash: text('secret_answer_hash').notNull(),
  hints: text('hints'), // JSON array of hint strings
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Game sessions (player progress in a room; not auth sessions) ─
export const gameSessions = sqliteTable('game_sessions', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  playerName: text('player_name').notNull(),
  startTime: text('start_time').notNull().$defaultFn(() => new Date().toISOString()),
  endTime: text('end_time'),
  currentPuzzleId: text('current_puzzle_id').references(() => puzzles.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export type Room = typeof rooms.$inferSelect
export type NewRoom = typeof rooms.$inferInsert
export type Puzzle = typeof puzzles.$inferSelect
export type NewPuzzle = typeof puzzles.$inferInsert
export type GameSession = typeof gameSessions.$inferSelect
export type NewGameSession = typeof gameSessions.$inferInsert
