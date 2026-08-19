import Container from "../ui/Container";
import { partners } from "../../data/partners";

export default function Partners() {
  return (
    <section aria-label="Citado por" className="border-y border-border py-8">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium tracking-wide text-text-muted uppercase">
          {partners.map((partner) => (
            <li key={partner}>{partner}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
