import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogItems } from '@/lib/db/schema/catalog-items';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return NextResponse.json({ error: 'Invalid item ID format' }, { status: 400 });
    }

    const item = await db.select().from(catalogItems).where(eq(catalogItems.id, id));
    
    if (item.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item[0]);
  } catch (error) {
    console.error("GET Item Detail Error:", error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized - Only admin can update items' }, { status: 401 });
    }

    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid item ID format' }, { status: 400 });
    }

    const body = await req.json();
    
    const { name, imageUrl, category, price, currency, preorderDeadline, orderLink, notes } = body;
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (preorderDeadline !== undefined) updateData.preorderDeadline = preorderDeadline;
    if (orderLink !== undefined) updateData.orderLink = orderLink;
    if (notes !== undefined) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update. Accepted fields: name, imageUrl, category, price, currency, preorderDeadline, orderLink, notes'
      }, { status: 400 });
    }

    const updatedItem = await db
      .update(catalogItems)
      .set(updateData)
      .where(eq(catalogItems.id, id))
      .returning();

    if (updatedItem.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedItem[0]);
  } catch (error) {
    console.error("PATCH Item Error:", error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized - Only admin can delete items' }, { status: 401 });
    }

    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid item ID format' }, { status: 400 });
    }
    
    const deletedItem = await db
      .delete(catalogItems)
      .where(eq(catalogItems.id, id))
      .returning();

    if (deletedItem.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: deletedItem[0] });
  } catch (error) {
    console.error("DELETE Item Error:", error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
