import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
    
    // Validasi format UUID agar database tidak error
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return NextResponse.json({ error: 'Invalid circle ID format' }, { status: 400 });
    }

    const circle = await db.select().from(circles).where(eq(circles.id, id));
    
    if (circle.length === 0) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    return NextResponse.json(circle[0]);
  } catch (error) {
    console.error("GET Circle Detail Error:", error);
    return NextResponse.json({ error: 'Failed to fetch circle' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Only admin can update circles' }, { status: 401 });
    }

    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid circle ID format' }, { status: 400 });
    }

    const body = await req.json();
    
    const { name, boothCode, twitterUrl, instagramUrl, tags, daysAvailable } = body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (boothCode !== undefined) updateData.boothCode = boothCode;
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
    if (tags !== undefined) updateData.tags = tags;
    if (daysAvailable !== undefined) updateData.daysAvailable = daysAvailable;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update. Accepted fields: name, boothCode, twitterUrl, instagramUrl, tags, daysAvailable'
      }, { status: 400 });
    }

    const updatedCircle = await db
      .update(circles)
      .set(updateData)
      .where(eq(circles.id, id))
      .returning();

    if (updatedCircle.length === 0) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCircle[0]);
  } catch (error) {
    console.error("PATCH Circle Error:", error);
    return NextResponse.json({ error: 'Failed to update circle' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Only admin can delete circles' }, { status: 401 });
    }

    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid circle ID format' }, { status: 400 });
    }
    
    const deletedCircle = await db
      .delete(circles)
      .where(eq(circles.id, id))
      .returning();

    if (deletedCircle.length === 0) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: deletedCircle[0] });
  } catch (error) {
    console.error("DELETE Circle Error:", error);
    return NextResponse.json({ error: 'Failed to delete circle' }, { status: 500 });
  }
}
