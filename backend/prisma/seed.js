import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from "../src/config/env.js";
import {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  DEFAULT_SALON_PROFILE,
} from "../src/config/systemDefaults.js";

const prisma = new PrismaClient();

async function main() {
  const permissionRecords = await Promise.all(
    PERMISSIONS.map((permission) =>
      prisma.permission.upsert({
        where: { key: permission.key },
        update: { description: permission.description },
        create: permission,
      })
    )
  );
  const permissionByKey = new Map(permissionRecords.map((permission) => [permission.key, permission]));

  for (const role of ROLES) {
    const roleRecord = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });

    for (const key of ROLE_PERMISSIONS[role.name]) {
      const permission = permissionByKey.get(key);
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roleRecord.id, permissionId: permission.id } },
        update: {},
        create: { roleId: roleRecord.id, permissionId: permission.id },
      });
    }
  }

  await seedOwnerUser();
  await seedSalonSettings();

  console.log("Seed completed: roles and permissions are in sync.");
}

// Linha única de configurações do salão. Sem chave natural pra upsert (é
// singleton) — só cria se ainda não existir nenhuma linha, igual ao bootstrap
// do owner.
async function seedSalonSettings() {
  const existing = await prisma.salonSettings.findFirst();
  if (existing) {
    console.log("Salon settings already exist — skipping.");
    return;
  }

  await prisma.salonSettings.create({ data: DEFAULT_SALON_PROFILE });

  console.log("Salon settings created with default values.");
}

// Bootstrap do primeiro usuário owner. Sem isso não há como obter a role
// owner via API (registro público sempre cai em "client"). Só roda se
// OWNER_EMAIL/OWNER_PASSWORD estiverem definidos — idempotente.
async function seedOwnerUser() {
  if (!env.ownerEmail || !env.ownerPassword) {
    console.log("OWNER_EMAIL/OWNER_PASSWORD not set — skipping owner bootstrap.");
    return;
  }

  const ownerRole = await prisma.role.findUniqueOrThrow({ where: { name: "owner" } });
  const existingOwner = await prisma.user.findFirst({ where: { email: env.ownerEmail } });

  if (existingOwner) {
    console.log(`Owner user already exists (${env.ownerEmail}) — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(env.ownerPassword, env.bcryptSaltRounds);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: "Owner",
        email: env.ownerEmail,
        passwordHash,
        roleId: ownerRole.id,
        status: "active",
      },
    });
    await tx.userRole.create({ data: { userId: user.id, roleId: ownerRole.id } });
  });

  console.log(`Owner user created (${env.ownerEmail}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
