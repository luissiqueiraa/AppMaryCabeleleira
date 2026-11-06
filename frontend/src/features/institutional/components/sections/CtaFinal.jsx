import { FiMapPin, FiPhone } from "react-icons/fi";
import Container from "../ui/Container";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import { groupBusinessHours } from "../../utils/salonHours";

// Horário, endereço e telefone vêm das configurações do salão: mudar no painel
// muda aqui, sem passar por código.
export default function CtaFinal({ salon }) {
  const faixas = groupBusinessHours(salon?.hours);
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="grid items-center gap-10 rounded-lg border border-border bg-gradient-to-br from-primary/25 via-bg to-bg p-8 sm:p-12 lg:grid-cols-2">
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
            {faixas.length > 0 ? (
              <dl className="mt-4 space-y-2 text-sm text-text-muted">
                {faixas.map((faixa) => (
                  <div key={faixa.label} className="flex justify-between gap-4">
                    <dt>{faixa.label}</dt>
                    <dd>{faixa.range}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-text-muted">Consulte nossos horários pelo telefone.</p>
            )}

            <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-text-muted">
              <p className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0 text-primary-light" aria-hidden="true" />
                {salon?.address ?? "Endereço disponível no telefone abaixo"}
              </p>
              <p className="flex items-center gap-2">
                <FiPhone className="shrink-0 text-primary-light" aria-hidden="true" />
                {salon?.phone ? (
                  <a href={`tel:${salon.phone.replace(/\D/g, "")}`} className="hover:text-text">
                    {salon.phone}
                  </a>
                ) : (
                  "Telefone em breve"
                )}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
