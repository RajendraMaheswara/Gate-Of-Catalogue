import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogItems } from '@/lib/db/schema/catalog-items';
import { circles } from '@/lib/db/schema/circles';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validasi UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return NextResponse.json({ error: 'Invalid circle ID format' }, { status: 400 });
    }

    const items = await db.select().from(catalogItems).where(eq(catalogItems.circleId, id));
    
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET Catalog Items Error:", error);
    return NextResponse.json({ error: 'Failed to fetch catalog items' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Only admin can create items' }, { status: 401 });
    }

    const { id } = await params;
    
    // Validasi UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return NextResponse.json({ error: 'Invalid circle ID format' }, { status: 400 });
    }
    
    // Pastikan circle exist
    const circle = await db.select({ id: circles.id }).from(circles).where(eq(circles.id, id));
    if (circle.length === 0) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, imageUrl, category, price, currency, preorderDeadline, orderLink, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const newItem = await db.insert(catalogItems).values({
      circleId: id,
      name,
      imageUrl,
      category,
      price,
      currency: currency || 'IDR',
      preorderDeadline,
      orderLink,
      notes
    }).returning();

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error("POST Catalog Item Error:", error);
    return NextResponse.json({ error: 'Failed to create catalog item' }, { status: 500 });
  }
}
