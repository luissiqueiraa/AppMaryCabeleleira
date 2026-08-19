import { FiChevronRight } from "react-icons/fi";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import GlowOrbs from "../ui/GlowOrbs";
import { services } from "../../data/services";

export default function Services() {
  return (
    <section id="servicos" className="relative overflow-hidden py-20 sm:py-28">
      <GlowOrbs />
      <Container className="relative">
        <SectionHeading eyebrow="O que oferecemos" title="Todos os nossos" accent="serviços." />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <li
                key={service.name}
                className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-primary-light"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
                  <Icon size={20} className="text-white" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{service.name}</h3>
                <p className="mt-2 text-sm text-text-muted">{service.description}</p>
                <a
                  href="#agendamento"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-light uppercase hover:underline"
                >
                  Saber mais
                  <FiChevronRight aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
