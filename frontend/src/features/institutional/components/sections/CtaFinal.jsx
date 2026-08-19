import { FiMapPin, FiPhone } from "react-icons/fi";
import Container from "../ui/Container";
import Button from "../ui/Button";

const SCHEDULE = [
  { day: "Segunda – Sexta", hours: "09:00 – 20:00" },
  { day: "Sábado", hours: "09:00 – 18:00" },
];

export default function CtaFinal() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-10 rounded-lg border border-border bg-gradient-to-br from-primary/25 via-bg to-bg p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Vem se cuidar. <em className="font-medium text-primary-light italic">Você merece.</em>
            </h2>
            <p className="mt-4 max-w-md text-text-muted">
              Resultados que falam por si, em um ambiente pensado para o seu bem-estar.
            </p>
            <Button to="/agendar" variant="primary" className="mt-6">
              Agendar horário
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Horário de funcionamento
            </h3>
            <dl className="mt-4 space-y-2 text-sm text-text-muted">
              {SCHEDULE.map((item) => (
                <div key={item.day} className="flex justify-between gap-4">
                  <dt>{item.day}</dt>
                  <dd>{item.hours}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-text-muted">
              <p className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0 text-primary-light" aria-hidden="true" />
                R. Caetano Pinto, 415 — São Paulo, SP
              </p>
              <p className="flex items-center gap-2">
                <FiPhone className="shrink-0 text-primary-light" aria-hidden="true" />
                (11) 5566-3366
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
