import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: "manage_users", description: "Create, update and deactivate user accounts" },
  { key: "manage_roles", description: "Create, update and delete roles and their permissions" },
  { key: "manage_services", description: "Manage the services catalog" },
  { key: "manage_schedules", description: "Manage employee work schedules" },
  { key: "manage_appointments", description: "Manage client appointments" },
  { key: "manage_financial", description: "Manage financial transactions and payments" },
  { key: "manage_reports", description: "Access business reports" },
  { key: "manage_settings", description: "Manage critical salon settings" },
  { key: "view_dashboard", description: "View dashboard metrics" },
];

const ROLES = [
  { name: "owner", description: "Full access. Manages roles, permissions and critical settings." },
  { name: "admin", description: "Manages daily operations. Cannot alter the owner." },
  { name: "employee", description: "Manages own schedule and linked clients." },
  { name: "client", description: "Accesses only their own data." },
];

// client tem acesso garantido por ownership (próprios dados), não por permission.
const ROLE_PERMISSIONS = {
  owner: PERMISSIONS.map((permission) => permission.key),
  admin: [
    "manage_users",
    "manage_services",
    "manage_schedules",
    "manage_appointments",
    "manage_financial",
    "manage_reports",
    "view_dashboard",
  ],
  employee: ["manage_schedules", "manage_appointments", "view_dashboard"],
  client: [],
};

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

  console.log("Seed completed: roles and permissions are in sync.");
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
