import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const guestbookEntries = pgTable('guestbook_entries', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  institution: text('institution').notNull(),
  phone: text('phone').notNull(),
  purpose: text('purpose').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
