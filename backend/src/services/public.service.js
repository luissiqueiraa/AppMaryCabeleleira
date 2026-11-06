import * as settingsRepository from "../repositories/settings.repository.js";
import * as servicesRepository from "../repositories/services.repository.js";
import * as employeesRepository from "../repositories/employees.repository.js";

// Dados do site institucional: aberto a quem não tem conta, então o DTO é
// recortado à mão. Nada de reaproveitar o DTO interno — ali vão e-mail de
// funcionária, telefone de cliente e ids que a vitrine não precisa.
// A profissional leva o id porque a home oferece "Agendar com <nome>" e esse
// link pré-seleciona ela no fluxo de agendamento.
export async function getHomeContent() {
  const [settings, services, employees] = await Promise.all([
    settingsRepository.findSettings(),
    servicesRepository.findAllServices({ activeOnly: true }),
    employeesRepository.findAllEmployees({ activeOnly: true }),
  ]);

  return {
    salon: settings
      ? {
          name: settings.name,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          logoUrl: settings.logoUrl,
          hours: settings.hours,
        }
      : null,
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      duration: service.duration,
      price: Number(service.price),
    })),
    professionals: employees.map((employee) => ({
      id: employee.id,
      fullName: employee.user.fullName,
      avatarUrl: employee.user.avatarUrl,
    })),
  };
}
