import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userItems } from '@/lib/db/schema/user-items';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 });
    }

    const { id } = await params;

    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid user item ID format' }, { status: 400 });
    }

    const userId = session.user.id;
    const body = await req.json();
    
    const { decided, finalPrice, type, notes, deadline, sourcePostUrl, statusNotes } = body;
    const updateData: any = {};
    
    if (decided !== undefined) updateData.decided = decided;
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;
    if (type !== undefined) updateData.type = type;
    if (notes !== undefined) updateData.notes = notes;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (sourcePostUrl !== undefined) updateData.sourcePostUrl = sourcePostUrl;
    if (statusNotes !== undefined) updateData.statusNotes = statusNotes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update. Accepted fields: decided, finalPrice, type, notes, deadline, sourcePostUrl, statusNotes'
      }, { status: 400 });
    }

    const updatedItem = await db
      .update(userItems)
      .set(updateData)
      .where(and(eq(userItems.id, id), eq(userItems.userId, userId)))
      .returning();

    if (updatedItem.length === 0) {
      return NextResponse.json({ error: 'User item not found or you do not have permission to update it' }, { status: 404 });
    }

    return NextResponse.json(updatedItem[0]);
  } catch (error) {
    console.error("PATCH User Item Error:", error);
    return NextResponse.json({ error: 'Failed to update user item' }, { status: 500 });
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

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 });
    }

    const { id } = await params;

    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid user item ID format' }, { status: 400 });
    }

    const userId = session.user.id;
    
    const deletedItem = await db
      .delete(userItems)
      .where(and(eq(userItems.id, id), eq(userItems.userId, userId)))
      .returning();

    if (deletedItem.length === 0) {
      return NextResponse.json({ error: 'User item not found or you do not have permission to delete it' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: deletedItem[0] });
  } catch (error) {
    console.error("DELETE User Item Error:", error);
    return NextResponse.json({ error: 'Failed to delete user item' }, { status: 500 });
  }
}
