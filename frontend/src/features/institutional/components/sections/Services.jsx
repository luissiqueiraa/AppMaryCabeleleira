import { FiChevronRight, FiScissors, FiDroplet, FiSun, FiWind, FiStar, FiHeart } from "react-icons/fi";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

export default function Services() {
  return (
    <section id="servicos" className="relative overflow-hidden py-20 sm:py-28">
      <Container className="relative">
        <SectionHeading eyebrow="O que oferecemos" title="Todos os nossos" accent="serviços." />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-primary-light">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <FiScissors size={20} className="text-white" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">Cortes</h3>
            <p className="mt-2 text-sm text-text-muted">
              Cortes personalizados que valorizam a estrutura do seu rosto e estilo pessoal.
            </p>
            <a
              href="#agendamento"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-light uppercase hover:underline"
            >
              Saber mais
              <FiChevronRight aria-hidden="true" />
            </a>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-primary-light">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <FiDroplet size={20} className="text-white" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">Coloração</h3>
            <p className="mt-2 text-sm text-text-muted">
              Técnicas de coloração avançada, do clássico às tendências mais atuais.
            </p>
            <a
              href="#agendamento"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-light uppercase hover:underline"
            >
              Saber mais
              <FiChevronRight aria-hidden="true" />
            </a>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-primary-light">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <FiSun size={20} className="text-white" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">Progressivas</h3>
            <p className="mt-2 text-sm text-text-muted">
              Tratamentos alisantes duradouros que respeitam a saúde dos seus fios.
            </p>
            <a
              href="#agendamento"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-light uppercase hover:underline"
            >
              Saber mais
              <FiChevronRight aria-hidden="true" />
            </a>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-primary-light">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <FiWind size={20} className="text-white" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">Escovas</h3>
            <p className="mt-2 text-sm text-text-muted">
              Escovas modeladoras com acabamento profissional para qualquer ocasião.
            </p>
            <a
              href="#agendamento"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-light uppercase hover:underline"
            >
              Saber mais
              <FiChevronRight aria-hidden="true" />
            </a>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-primary-light">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <FiStar size={20} className="text-white" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">Botox & Selagem</h3>
            <p className="mt-2 text-sm text-text-muted">
              Reposição de massa capilar para fios mais fortes, lisos e brilhantes.
            </p>
            <a
              href="#agendamento"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-light uppercase hover:underline"
            >
              Saber mais
              <FiChevronRight aria-hidden="true" />
            </a>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-primary-light">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <FiHeart size={20} className="text-white" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">Hidratação</h3>
            <p className="mt-2 text-sm text-text-muted">
              Protocolos de hidratação profunda que renovam a vitalidade do cabelo.
            </p>
            <a
              href="#agendamento"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-light uppercase hover:underline"
            >
              Saber mais
              <FiChevronRight aria-hidden="true" />
            </a>
          </li>
        </ul>
      </Container>
    </section>
  );
}
