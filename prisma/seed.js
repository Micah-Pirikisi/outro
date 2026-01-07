import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create author user
  const hashedPassword = await bcrypt.hash("Tadiwa13", 10);

  const author = await prisma.user.upsert({
    where: { email: "micahpirikski@gmail.com" },
    update: {},
    create: {
      email: "micahpirikski@gmail.com",
      name: "Micah",
      password: hashedPassword,
      role: "author",
    },
  });

  console.log("Author user seeded:", author);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
