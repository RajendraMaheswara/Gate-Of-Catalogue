import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userItems } from '@/lib/db/schema/user-items';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import ExcelJS from 'exceljs';

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Shopping List');

    worksheet.columns = [
      { header: 'Event', key: 'eventLabel', width: 20 },
      { header: 'Circle', key: 'circleName', width: 20 },
      { header: 'Item Name', key: 'name', width: 30 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Final Price', key: 'finalPrice', width: 15 },
      { header: 'Decided', key: 'decided', width: 10 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Deadline', key: 'deadline', width: 15 },
      { header: 'Source Post URL', key: 'sourcePostUrl', width: 30 },
      { header: 'Status Notes', key: 'statusNotes', width: 30 },
      { header: 'System_Catalog_ID (Do Not Edit)', key: 'catalogItemId', width: 40 },
    ];

    items.forEach(item => {
      worksheet.addRow({
        eventLabel: item.eventLabel,
        circleName: item.circleName,
        name: item.name,
        price: item.price,
        finalPrice: item.finalPrice,
        decided: item.decided,
        type: item.type,
        notes: item.notes,
        deadline: item.deadline,
        sourcePostUrl: item.sourcePostUrl,
        statusNotes: item.statusNotes,
        catalogItemId: item.catalogItemId
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="gofca_shopping_list.xlsx"'
      }
    });
  } catch (error) {
    console.error("Export Excel Error:", error);
    return NextResponse.json({ error: 'Failed to export to excel' }, { status: 500 });
  }
}
