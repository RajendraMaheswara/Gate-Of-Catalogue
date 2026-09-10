import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userItems } from '@/lib/db/schema/user-items';
import { catalogItems } from '@/lib/db/schema/catalog-items';
import { circles } from '@/lib/db/schema/circles';
import { events } from '@/lib/db/schema/events';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const items = await db.select().from(userItems).where(eq(userItems.userId, userId));
    
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET User Items Error:", error);
    return NextResponse.json({ error: 'Failed to fetch user items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { catalogItemId } = body;

    if (!catalogItemId) {
      return NextResponse.json({ error: 'catalogItemId is required' }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(catalogItemId)) {
      return NextResponse.json({ error: 'Invalid catalogItemId format' }, { status: 400 });
    }

    // Ambil data catalogItem, circle, dan event untuk di-copy
    const itemData = await db.select({
      name: catalogItems.name,
      imageUrl: catalogItems.imageUrl,
      price: catalogItems.price,
      currency: catalogItems.currency,
      circleName: circles.name,
      eventLabel: events.name
    })
    .from(catalogItems)
    .innerJoin(circles, eq(catalogItems.circleId, circles.id))
    .innerJoin(events, eq(circles.eventId, events.id))
    .where(eq(catalogItems.id, catalogItemId));

    if (itemData.length === 0) {
      return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 });
    }

    const data = itemData[0];

    const newUserItem = await db.insert(userItems).values({
      userId,
      catalogItemId,
      eventLabel: data.eventLabel,
      circleName: data.circleName,
      name: data.name,
      price: data.price,
      decided: false
    }).returning();

    return NextResponse.json(newUserItem[0], { status: 201 });
  } catch (error) {
    console.error("POST User Item Error:", error);
    return NextResponse.json({ error: 'Failed to add item to user list' }, { status: 500 });
  }
}
