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

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        nextRenewalDate: "asc",
      },
      select: {
        name: true,
        amount: true,
        billingCycle: true,
        nextRenewalDate: true,
        category: true,
        planName: true,
        isActive: true,
        createdAt: true,
      },
    });

    const formattedSubscriptions = subscriptions.map((subscription) => ({
      name: subscription.name,
      amount: subscription.amount.toString(),
      billingCycle: subscription.billingCycle,
      nextRenewalDate: subscription.nextRenewalDate,
      category: subscription.category,
      planName: subscription.planName ?? "",
      isActive: subscription.isActive ? "Active" : "Inactive",
      createdAt: subscription.createdAt,
    }));

    const csv = convertToCsv(formattedSubscriptions, [
      { label: "Name", key: "name" },
      { label: "Amount", key: "amount" },
      { label: "Billing Cycle", key: "billingCycle" },
      { label: "Next Renewal Date", key: "nextRenewalDate" },
      { label: "Category", key: "category" },
      { label: "Plan Name", key: "planName" },
      { label: "Status", key: "isActive" },
      { label: "Created At", key: "createdAt" },
    ]);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="ledgeros-subscriptions.csv"',
      },
    });
  } catch (error) {
    console.error("Export subscriptions error:", error);

    return NextResponse.json(
      { error: "Failed to export subscriptions" },
      { status: 500 }
    );
  }
}