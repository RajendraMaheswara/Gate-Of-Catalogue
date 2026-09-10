import { pgTable, text, timestamp, uuid, numeric, date, index } from 'drizzle-orm/pg-core';
import { circles } from './circles';

export const catalogItems = pgTable('catalog_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  circleId: uuid('circle_id').references(() => circles.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url'),
  name: text('name').notNull(),
  category: text('category'),
  price: numeric('price'),
  currency: text('currency').default('IDR'),
  preorderDeadline: date('preorder_deadline'),
  orderLink: text('order_link'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    circleIdx: index('idx_items_circle').on(table.circleId),
  };
});
