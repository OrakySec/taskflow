/**
 * Script para criar o Super Admin do TaskFlow
 *
 * USO NO VPS:
 *   docker exec -it <nome-do-container> node scripts/create-super-admin.js
 *
 * Ou com variáveis de ambiente:
 *   SUPER_ADMIN_EMAIL=seu@email.com SUPER_ADMIN_PASSWORD=suasenha SUPER_ADMIN_NAME="Seu Nome" \
 *   docker exec -i <nome-do-container> node scripts/create-super-admin.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const prisma = new PrismaClient();

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║    TaskFlow — Criar Super Admin      ║");
  console.log("╚══════════════════════════════════════╝\n");

  const name = process.env.SUPER_ADMIN_NAME || await prompt("Nome do Super Admin: ");
  const email = process.env.SUPER_ADMIN_EMAIL || await prompt("E-mail: ");
  const password = process.env.SUPER_ADMIN_PASSWORD || await prompt("Senha (mín. 6 caracteres): ");

  if (!name || !email || !password) {
    console.error("\n❌ Todos os campos são obrigatórios.\n");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("\n❌ A senha deve ter pelo menos 6 caracteres.\n");
    process.exit(1);
  }

  // Verifica se já existe super admin
  const existing = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existing) {
    console.log(`\n⚠️  Já existe um Super Admin cadastrado: ${existing.email}`);
    const confirm = process.env.FORCE || await prompt("Criar mesmo assim? (s/N): ");
    if (confirm.toLowerCase() !== "s") {
      console.log("Operação cancelada.\n");
      process.exit(0);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Garante que a empresa sistema existe
  await prisma.company.upsert({
    where: { slug: "system" },
    update: {},
    create: { id: "system-company-id", name: "Sistema TaskFlow", slug: "system" },
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      companyId: "system-company-id",
    },
  });

  console.log("\n✅ Super Admin criado com sucesso!");
  console.log(`   Nome:  ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role:  SUPER_ADMIN`);
  console.log("\n🔗 Acesse: https://seu-dominio.com/login\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Erro ao criar Super Admin:", e.message, "\n");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
