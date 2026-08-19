import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { processSteps } from "../../data/process";

export default function Process() {
  return (
    <section id="agendamento" className="py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow="Simples assim" title="Em 4 toques," accent="está agendado." />

        <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute top-6 right-0 left-0 hidden h-px bg-border lg:block"
          />
          {processSteps.map((item) => (
            <li key={item.step} className="relative text-center sm:text-left">
              <span className="font-display relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary-light bg-bg text-lg font-semibold text-primary-light">
                {item.step}
              </span>
              <h3 className="mt-4 font-display font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
