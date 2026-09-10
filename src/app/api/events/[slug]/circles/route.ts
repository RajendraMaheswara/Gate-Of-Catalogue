import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { circles } from '@/lib/db/schema/circles';
import { events } from '@/lib/db/schema/events';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // 1. Cari event ID berdasarkan slug
    const event = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug));
    
    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventId = event[0].id;

    // 2. Ambil semua circle untuk event tersebut
    const eventCircles = await db.select().from(circles).where(eq(circles.eventId, eventId));
    
    return NextResponse.json(eventCircles);
  } catch (error) {
    console.error("GET Circles Error:", error);
    return NextResponse.json({ error: 'Failed to fetch circles' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Only admin can create circles' }, { status: 401 });
    }

    const { slug } = await params;
    
    // Cari event ID tempat circle ini akan ditambahkan
    const event = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug));
    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventId = event[0].id;
    
    const body = await req.json();
    const { name, boothCode, twitterUrl, instagramUrl, tags, daysAvailable } = body;

    if (!name) {
      return NextResponse.json({ error: 'Circle name is required' }, { status: 400 });
    }

    const newCircle = await db.insert(circles).values({
      eventId,
      name,
      boothCode,
      twitterUrl,
      instagramUrl,
      tags: tags || [],
      daysAvailable: daysAvailable || []
    }).returning();

    return NextResponse.json(newCircle[0], { status: 201 });
  } catch (error) {
    console.error("POST Circle Error:", error);
    return NextResponse.json({ error: 'Failed to create circle' }, { status: 500 });
  }
}
