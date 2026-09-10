import { pgTable, text, timestamp, uuid, numeric, boolean, index } from 'drizzle-orm/pg-core';
import { catalogItems } from './catalog-items';
import { users } from './auth';

export const userItems = pgTable('user_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  catalogItemId: uuid('catalog_item_id').references(() => catalogItems.id, { onDelete: 'set null' }),
  // Grouping: user bisa tag item ke event tertentu (e.g. "CP7", "CF24")
  // Nullable — item bisa tidak di-assign ke event manapun
  eventLabel: text('event_label'),
  // Nama circle/booth asal item — bebas diisi user (tidak harus ada di direktori resmi)
  circleName: text('circle_name'),
  name: text('name').notNull(),
  price: numeric('price'),
  finalPrice: numeric('final_price'),
  decided: boolean('decided').default(false),
  type: text('type'),
  notes: text('notes'),
  deadline: text('deadline'),
  sourcePostUrl: text('source_post_url'),
  statusNotes: text('status_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    userIdx: index('idx_user_items_user').on(table.userId),
    // Index tambahan untuk query filter per event
    eventLabelIdx: index('idx_user_items_event_label').on(table.userId, table.eventLabel),
  };
});
