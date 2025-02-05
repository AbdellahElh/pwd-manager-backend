// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "defaultPassword"; // Change as needed.
const SALT_ROUNDS = 10;

async function main() {
  // Clear existing credentials and users (order matters because of relations)
  await prisma.credential.deleteMany();
  await prisma.user.deleteMany();

  // Define an array with five users
  const usersData = [
    { email: "alice@example.com" },
    { email: "bob@example.com" },
    { email: "charlie@example.com" },
    { email: "david@example.com" },
    { email: "eve@example.com" },
  ];

  // Create each user with a hashed password and two credential items
  for (const user of usersData) {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    await prisma.user.create({
      data: {
        email: user.email,
        passwordHash,
        // Optionally, you can leave faceDescriptor as null
        credentials: {
          create: [
            {
              title: "Instagram",
              website: "https://www.instagram.com",
              username: user.email,
              password: "password1", // In production, encrypt this field if needed.
            },
            {
              title: "Facebook",
              website: "https://www.facebook.com",
              username: user.email,
              password: "password2",
            },
          ],
        },
      },
    });
  }

  console.log("Seeded 5 users with 2 credentials each successfully.");
}

main()
  .catch((error) => {
    console.error("Error seeding data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
