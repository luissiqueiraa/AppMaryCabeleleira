import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import GradientBlock from "../ui/GradientBlock";

export default function Team() {
  return (
    <section id="equipe" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Nossa equipe"
          title="Mãos que sabem"
          accent="exatamente o que fazem."
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-lg border border-border bg-surface/70 p-4 backdrop-blur-sm">
            <GradientBlock className="h-48" />
            <h3 className="mt-4 font-display font-semibold">Camila Rocha</h3>
            <p className="text-xs text-text-muted">Colorista premium</p>
            <Button to="/agendar" variant="secondary" className="mt-4 w-full text-xs">
              Agendar com Camila
            </Button>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-4 backdrop-blur-sm">
            <GradientBlock className="h-48" />
            <h3 className="mt-4 font-display font-semibold">Helena Marques</h3>
            <p className="text-xs text-text-muted">Stylist premium</p>
            <Button to="/agendar" variant="secondary" className="mt-4 w-full text-xs">
              Agendar com Helena
            </Button>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-4 backdrop-blur-sm">
            <GradientBlock className="h-48" />
            <h3 className="mt-4 font-display font-semibold">Bianca Lima</h3>
            <p className="text-xs text-text-muted">Visagista premium</p>
            <Button to="/agendar" variant="secondary" className="mt-4 w-full text-xs">
              Agendar com Bianca
            </Button>
          </li>
          <li className="rounded-lg border border-border bg-surface/70 p-4 backdrop-blur-sm">
            <GradientBlock className="h-48" />
            <h3 className="mt-4 font-display font-semibold">Ana Souza</h3>
            <p className="text-xs text-text-muted">Nail expert</p>
            <Button to="/agendar" variant="secondary" className="mt-4 w-full text-xs">
              Agendar com Ana
            </Button>
          </li>
        </ul>
      </Container>
    </section>
  );
}
