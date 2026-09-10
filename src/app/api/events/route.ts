import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema/events';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const allEvents = await db.select().from(events);
    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("GET Events Error:", error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Cek Autentikasi & Otorisasi
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Only admin can create events' }, { status: 401 });
    }

    // 2. Ambil data dari body
    const body = await req.json();
    const { name, slug, dateStart, dateEnd, location, description } = body;

    // 3. Validasi
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // 4. Masukkan ke database
    const newEvent = await db.insert(events).values({
      name,
      slug,
      dateStart,
      dateEnd,
      location,
      description
    }).returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error: any) {
    console.error("POST Events Error:", error);
    if (error.code === '23505') { // Postgres unique constraint violation
      return NextResponse.json({ error: 'Event with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
