import { FiChevronRight, FiScissors, FiDroplet, FiSun, FiWind, FiClock } from "react-icons/fi";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { formatBRL } from "../../../../shared/utils/formatCurrency";

// O catálogo vem do banco, mas ícone é decisão visual: mapeado pela categoria
// que o serviço já tem cadastrada.
const CATEGORY_ICON = {
  hair: FiScissors,
  nails: FiDroplet,
  makeup: FiSun,
  brows: FiWind,
};

export default function Services({ services = [], loadStatus = "success" }) {
  return (
    <section id="servicos" className="relative overflow-hidden py-20 sm:py-28">
      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow="O que oferecemos" title="Todos os nossos" accent="serviços." />
        </Reveal>

        {loadStatus === "loading" && (
          <p className="mt-12 text-sm text-text-muted">Carregando serviços...</p>
        )}

        {/* Catálogo vazio ou API fora não pode deixar um buraco na página: a
            cliente ainda precisa saber que pode ligar e perguntar. */}
        {loadStatus !== "loading" && services.length === 0 && (
          <p className="mt-12 rounded-lg border border-border bg-surface/70 p-8 text-center text-sm text-text-muted">
            Nossa lista de serviços está sendo atualizada. Fale com o salão para saber tudo o que
            oferecemos no momento.
          </p>
        )}

        {services.length > 0 && (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const Icon = CATEGORY_ICON[service.category] ?? FiScissors;
              return (
                <Reveal
                  as="li"
                  key={service.id}
                  // Cascata curta: o olho acompanha a sequência sem esperar.
                  delay={index * 70}
                  className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-primary-light"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
                    <Icon size={20} className="text-white" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{service.name}</h3>

                  <p className="mt-2 flex items-center gap-1.5 text-sm text-primary-light">
                    <FiClock size={14} aria-hidden="true" />
                    {service.duration} min · {formatBRL(service.price)}
                  </p>

                  {service.description && (
                    <p className="mt-2 text-sm text-text-muted">{service.description}</p>
                  )}

                  <a
                    href="#agendamento"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-light uppercase hover:underline"
                  >
                    Agendar
                    <FiChevronRight aria-hidden="true" />
                  </a>
                </Reveal>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
