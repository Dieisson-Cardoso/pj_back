import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const car = await prisma.car.findFirst();
    console.log("Conexão bem-sucedida!");
  } catch (e) {
    console.error("Erro ao conectar ao banco de dados:", e);
  } finally {
    await prisma.$disconnect();
  }
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
