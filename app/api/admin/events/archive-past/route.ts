import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  const today = new Date();

  const startOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const result = await prisma.event.updateMany({
    where: {
      isActive: true,
      OR: [
        {
          endDate: {
            lt: startOfCurrentMonth,
          },
        },
        {
          endDate: null,
          date: {
            lt: startOfCurrentMonth,
          },
        },
      ],
    },
    data: {
      isActive: false,
    },
  });

  return NextResponse.json({
    success: true,
    archivedCount: result.count,
  });
}