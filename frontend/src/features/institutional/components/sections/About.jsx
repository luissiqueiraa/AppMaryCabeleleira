import { FiCheck } from "react-icons/fi";
import Container from "../ui/Container";
import Button from "../ui/Button";
import GradientBlock from "../ui/GradientBlock";
import { aboutHighlights } from "../../data/stats";

export default function About() {
  return (
    <section id="sobre" className="py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <GradientBlock from="#eddfc8" to="#a07b52" className="h-72 sm:h-96" />
          <div className="absolute -top-4 -left-4 rounded-md border border-border bg-surface px-4 py-2 text-center shadow-lg">
            <p className="font-display text-lg font-semibold text-primary-light">2010</p>
            <p className="text-[10px] tracking-wide text-text-muted uppercase">desde</p>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-primary-light uppercase">
            Nossa história
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Arte capilar de <em className="font-medium text-primary-light italic">excelência</em>{" "}
            desde 2010.
          </h2>
          <p className="mt-6 text-text-muted">
            No MaryCabeleleira, acreditamos que cada cabelo é uma história a ser contada. Nossa
            equipe une formação contínua e produtos premium para entregar resultados que vão além
            da expectativa.
          </p>

          <ul className="mt-6 space-y-3">
            {aboutHighlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <FiCheck className="text-primary-light" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <Button to="/agendar" variant="primary" className="mt-8">
            Saber mais
          </Button>
        </div>
      </Container>
    </section>
  );
}
