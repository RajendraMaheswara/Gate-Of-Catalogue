import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { events } from './events';

export const circles = pgTable('circles', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  boothCode: text('booth_code'),
  twitterUrl: text('twitter_url'),
  instagramUrl: text('instagram_url'),
  tags: text('tags').array().default([]),
  daysAvailable: text('days_available').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    eventIdx: index('idx_circles_event').on(table.eventId),
  };
});
