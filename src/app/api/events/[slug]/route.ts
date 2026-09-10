import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema/events';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> } // Next.js 15: params is a promise
) {
  try {
    const { slug } = await params;
    const event = await db.select().from(events).where(eq(events.slug, slug));
    
    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event[0]);
  } catch (error) {
    console.error("GET Event Detail Error:", error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Only admin can update events' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { name, newSlug, dateStart, dateEnd, location, description } = body;

    // Filter hanya field yang diubah
    const updateData: any = {};
    if (name) updateData.name = name;
    if (newSlug) updateData.slug = newSlug;
    if (dateStart !== undefined) updateData.dateStart = dateStart;
    if (dateEnd !== undefined) updateData.dateEnd = dateEnd;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update. Accepted fields: name, newSlug, dateStart, dateEnd, location, description'
      }, { status: 400 });
    }

    const updatedEvent = await db
      .update(events)
      .set(updateData)
      .where(eq(events.slug, slug))
      .returning();

    if (updatedEvent.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updatedEvent[0]);
  } catch (error: any) {
    console.error("PATCH Event Error:", error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Event with this new slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Only admin can delete events' }, { status: 401 });
    }

    const { slug } = await params;
    
    const deletedEvent = await db
      .delete(events)
      .where(eq(events.slug, slug))
      .returning();

    if (deletedEvent.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: deletedEvent[0] });
  } catch (error) {
    console.error("DELETE Event Error:", error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
