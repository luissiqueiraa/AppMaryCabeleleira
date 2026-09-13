import { FiStar } from "react-icons/fi";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

export default function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Altamente recomendados"
            title="O que dizem nossas"
            accent="clientes."
          />
          <div className="flex items-center gap-2 text-sm">
            <div className="flex text-primary-light" aria-hidden="true">
              <FiStar fill="currentColor" />
              <FiStar fill="currentColor" />
              <FiStar fill="currentColor" />
              <FiStar fill="currentColor" />
              <FiStar fill="currentColor" />
            </div>
            <span className="font-semibold">4.9</span>
            <span className="text-text-muted">5mil+ avaliações</span>
          </div>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          <li className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm">
            <p className="text-text-muted">
              “Saí do MaryCabeleleira me sentindo outra mulher. A Camila é uma maga das cores.”
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/30" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Letícia Borges</p>
                <p className="text-xs text-text-muted">Cliente há 3 anos</p>
              </div>
            </div>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm">
            <p className="text-text-muted">
              “Agendei minha hora pelo app e em 2 minutos já estava confirmado. Atendimento
              impecável.”
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/30" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Mariana Costa</p>
                <p className="text-xs text-text-muted">Cliente há 1 ano</p>
              </div>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  );
}
