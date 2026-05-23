import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { convertToCsv } from "@/lib/export-to-csv";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        name: true,
        amount: true,
        category: true,
        note: true,
        spentAt: true,
        createdAt: true,
      },
    });

    const formattedExpenses = expenses.map((expense) => ({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      note: expense.note ?? "",
      spentAt: expense.spentAt,
      createdAt: expense.createdAt,
    }));

    const csv = convertToCsv(formattedExpenses, [
      { label: "Name", key: "name" },
      { label: "Amount", key: "amount" },
      { label: "Category", key: "category" },
      { label: "Note", key: "note" },
      { label: "Spent At", key: "spentAt" },
      { label: "Created At", key: "createdAt" },
    ]);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ledgeros-expenses.csv"',
      },
    });
  } catch (error) {
    console.error("Export expenses error:", error);

    return NextResponse.json(
      { error: "Failed to export expenses" },
      { status: 500 }
    );
  }
}