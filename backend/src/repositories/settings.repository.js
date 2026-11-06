import { prisma } from "../config/database.js";
import {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  DEFAULT_SALON_PROFILE,
} from "../config/systemDefaults.js";

export function findSettings() {
  return prisma.salonSettings.findFirst();
}

export function updateSettings(id, data) {
  return prisma.salonSettings.update({ where: { id }, data });
}

// Zera a base e recria o estado de fábrica. Sobrevivem duas coisas: a conta de
// quem pediu o reset (senão ela perde o acesso ao próprio sistema) e as contas
// de proprietária — uma admin pode zerar o salão, não pode apagar a dona dele.
// Tudo numa transação: um reset pela metade deixaria o sistema num estado
// pior que o anterior. Os deletes seguem a ordem das dependências; o que tem
// cascade (appointmentServices, userRoles, refreshTokens, notificações da
// cliente) cai junto com o pai.
export async function resetToDefaults({ actorId }) {
  // Timeout generoso: são muitos deletes em sequência e o padrão de 5s do
  // Prisma é curto demais para uma base com histórico.
  return prisma.$transaction(
    async (tx) => {
      const keptUsers = await tx.user.findMany({
        where: { OR: [{ id: actorId }, { role: { name: "owner" } }] },
        include: { role: true },
      });
      const keptIds = keptUsers.map((user) => user.id);

      const removed = {
        appointments: (await tx.appointment.deleteMany({})).count,
        notifications: (await tx.notification.deleteMany({})).count,
        services: (await tx.service.deleteMany({})).count,
        employees: (await tx.employee.deleteMany({})).count,
        users: (await tx.user.deleteMany({ where: { id: { notIn: keptIds } } })).count,
        auditLogs: (await tx.auditLog.deleteMany({})).count,
      };

      // Roles e permissions voltam ao padrão: as extras (criadas pelo admin em
      // /roles) somem, as padrão são recriadas com a matriz original.
      await tx.role.deleteMany({ where: { name: { notIn: ROLES.map((role) => role.name) } } });
      await tx.permission.deleteMany({ where: { key: { notIn: PERMISSIONS.map((item) => item.key) } } });

      const roleByName = new Map();
      const permissionByKey = new Map();
      for (const permission of PERMISSIONS) {
        const record = await tx.permission.upsert({
          where: { key: permission.key },
          update: { description: permission.description, deletedAt: null },
          create: permission,
        });
        permissionByKey.set(record.key, record);
      }

      for (const role of ROLES) {
        const roleRecord = await tx.role.upsert({
          where: { name: role.name },
          update: { description: role.description, deletedAt: null },
          create: role,
        });
        roleByName.set(roleRecord.name, roleRecord);

        await tx.rolePermission.deleteMany({ where: { roleId: roleRecord.id } });
        await tx.rolePermission.createMany({
          data: ROLE_PERMISSIONS[role.name].map((key) => ({
            roleId: roleRecord.id,
            permissionId: permissionByKey.get(key).id,
          })),
        });
      }

      // Cada conta preservada volta para a role que já tinha. Se essa role era
      // customizada, ela sumiu no passo acima e o roleId ficou nulo — aí a
      // conta cai em admin, que é o suficiente para continuar operando o salão
      // (só quem já podia chegar aqui está nessa lista).
      for (const user of keptUsers) {
        const role = roleByName.get(user.role?.name) ?? roleByName.get("admin");
        await tx.user.update({ where: { id: user.id }, data: { roleId: role.id } });
        await tx.userRole.deleteMany({ where: { userId: user.id } });
        await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });
      }

      const existingSettings = await tx.salonSettings.findFirst();
      const settings = existingSettings
        ? await tx.salonSettings.update({ where: { id: existingSettings.id }, data: DEFAULT_SALON_PROFILE })
        : await tx.salonSettings.create({ data: DEFAULT_SALON_PROFILE });

      return { removed, settings };
    },
    { timeout: 30000, maxWait: 10000 }
  );
}
