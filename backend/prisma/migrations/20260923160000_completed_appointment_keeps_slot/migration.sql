-- Um atendimento concluído gastou o horário: concluir antes da hora nao pode
-- devolver a vaga para outra cliente. Só cancelar (ou soft-deletar) libera.
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_employee_no_overlap";

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_employee_no_overlap"
  EXCLUDE USING gist (
    "employeeId" WITH =,
    tsrange("scheduledAt", "scheduledAt" + make_interval(mins => "durationMinutes")) WITH &&
  )
  WHERE (
    "deletedAt" IS NULL
    AND "employeeId" IS NOT NULL
    AND "status" IN ('pending', 'confirmed', 'completed')
  );

-- SetNull deixava o agendamento sem profissional quando a funcionária saía do
-- banco, e agendamento sem profissional escapa tanto do conflict-check quanto
-- da constraint acima. Excluir funcionária pelo app é soft delete, entao isso
-- so barra remocao manual — que e exatamente o caso perigoso.
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_employeeId_fkey";

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
