import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userItems } from '@/lib/db/schema/user-items';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import ExcelJS from 'exceljs';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet(1); // ambil sheet pertama
    if (!worksheet) {
      return NextResponse.json({ error: 'Invalid excel file' }, { status: 400 });
    }

    const itemsToInsert: any[] = [];

    // Asumsi header ada di baris 1, data mulai baris 2
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        itemsToInsert.push({
          userId,
          eventLabel: row.getCell(1).value?.toString(),
          circleName: row.getCell(2).value?.toString(),
          name: row.getCell(3).value?.toString(),
          price: row.getCell(4).value?.toString(),
          finalPrice: row.getCell(5).value?.toString(),
          decided: row.getCell(6).value === true || row.getCell(6).value?.toString() === 'true',
          type: row.getCell(7).value?.toString(),
          notes: row.getCell(8).value?.toString(),
          deadline: row.getCell(9).value?.toString(),
          sourcePostUrl: row.getCell(10).value?.toString(),
          statusNotes: row.getCell(11).value?.toString(),
          catalogItemId: row.getCell(12).value?.toString() || null, // uuid string or null
        });
      }
    });

    if (itemsToInsert.length > 0) {
      await db.insert(userItems).values(itemsToInsert);
    }

    return NextResponse.json({ success: true, count: itemsToInsert.length });
  } catch (error) {
    console.error("Import Excel Error:", error);
    return NextResponse.json({ error: 'Failed to import excel' }, { status: 500 });
  }
}
