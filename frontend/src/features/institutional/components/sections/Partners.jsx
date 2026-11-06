import Container from "../ui/Container";
import Reveal from "../ui/Reveal";

export default function Partners() {
  return (
    <section aria-label="Citado por" className="border-y border-border py-8">
      <Container>
        <Reveal>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium tracking-wide text-text-muted uppercase">
          <li>Vogue Brasil</li>
          <li>Glamour</li>
          <li>Harper's Bazaar</li>
          <li>Elle</li>
          <li>Vogue SP</li>
          <li>L'Officiel</li>
          <li>Time Out</li>
        </ul>
        </Reveal>
      </Container>
    </section>
  );
}
