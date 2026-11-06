-- A checagem de conflito em appointments.service.js resolve o caso normal, mas
-- duas clientes que clicam "confirmar" ao mesmo tempo passam as duas por ela
-- (leem a agenda antes de qualquer uma gravar). Só o banco consegue arbitrar:
-- a constraint abaixo recusa qualquer gravacao que sobreponha o intervalo de
-- um agendamento ativo da mesma profissional.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_employee_no_overlap"
  EXCLUDE USING gist (
    "employeeId" WITH =,
    tsrange("scheduledAt", "scheduledAt" + make_interval(mins => "durationMinutes")) WITH &&
  )
  WHERE (
    "deletedAt" IS NULL
    AND "employeeId" IS NOT NULL
    AND "status" IN ('pending', 'confirmed')
  );
