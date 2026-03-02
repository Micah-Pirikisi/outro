import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  // Create author user
  const hashedPassword = await bcrypt.hash("Tadiwa13", 10);

  const author = await prisma.user.upsert({
    where: { email: "micahpirikisi@gmail.com" },
    update: {
      name: "Micah",
      password: hashedPassword,
      role: "author",
    },
    create: {
      email: "micahpirikisi@gmail.com",
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
