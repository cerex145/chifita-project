import "../config/env";
import bcrypt from "bcryptjs";
import { prisma } from "../db";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@chifacademy.local";
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "Admin12345";

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      username,
      password: hashedPassword,
      provider: "LOCAL",
      role: "ADMIN",
    },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
