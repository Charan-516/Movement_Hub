import { generateInviteCode } from "../lib/invite";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.volunteerSignup.deleteMany();
  await prisma.event.deleteMany();

  await prisma.event.createMany({
    data: [
      {
        title: "Community Shred Day",
        date: new Date("2026-06-05T12:00:00"),
        startTime: "9:00 AM",
        endTime: "12:00 PM",
        location: "North Office",
        description:
          "Help members safely dispose of sensitive documents during our community shred event.",
        volunteerCapacity: 6,
        inviteCode: generateInviteCode(),
      },
      {
        title: "Financial Literacy Workshop",
        date: new Date("2026-06-12T12:00:00"),
        startTime: "2:00 PM",
        endTime: "4:00 PM",
        location: "South Office",
        description:
          "Volunteer to support setup, check-in, and guest assistance for a financial education workshop.",
        volunteerCapacity: 4,
        inviteCode: generateInviteCode(),
      },
      {
        title: "Charity Walk",
        date: new Date("2026-06-20T12:00:00"),
        startTime: "8:30 AM",
        endTime: "11:30 AM",
        location: "West Office",
        description:
          "Support the team, distribute water, and help guide participants.",
        volunteerCapacity: 10,
        inviteCode: generateInviteCode(),
      },
      {
        title: "Backpack Drive Sorting Day",
        date: new Date("2026-06-26T12:00:00"),
        startTime: "1:00 PM",
        endTime: "3:30 PM",
        location: "Headquarters",
        description:
          "Help sort, count, and prepare backpack drive donations before distribution.",
        volunteerCapacity: 8,
        inviteCode: generateInviteCode(),
      },
    ],
  });

  console.log("Seed data created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });