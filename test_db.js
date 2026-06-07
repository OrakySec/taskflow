const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.taskAttachment.findMany({take: 5, orderBy: {createdAt: 'desc'}}).then(console.log).finally(() => prisma.$disconnect());
