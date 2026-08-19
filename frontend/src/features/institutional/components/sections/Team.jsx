import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import GradientBlock from "../ui/GradientBlock";
import { team } from "../../data/team";

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
          {team.map((member) => (
            <li key={member.name} className="rounded-lg border border-border bg-surface/70 p-4 backdrop-blur-sm">
              <GradientBlock from={member.from} to={member.to} className="h-48" />
              <h3 className="mt-4 font-display font-semibold">{member.name}</h3>
              <p className="text-xs text-text-muted">{member.role}</p>
              <Button to="/agendar" variant="secondary" className="mt-4 w-full text-xs">
                Agendar com {member.name.split(" ")[0]}
              </Button>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
