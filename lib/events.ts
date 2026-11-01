import { prisma } from "./db";

export async function getEvents() {
  return prisma.event.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      date: "asc",
    },
    include: {
      signups: true,
      createdByAdmin: {
        select: {
          fullName: true,
          email: true,
        },
      },
      adminAssignments: {
        include: {
          admin: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });
}