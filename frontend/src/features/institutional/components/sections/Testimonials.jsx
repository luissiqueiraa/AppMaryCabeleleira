import { FiStar } from "react-icons/fi";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { testimonials, ratingSummary } from "../../data/testimonials";

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
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} fill="currentColor" />
              ))}
            </div>
            <span className="font-semibold">{ratingSummary.average}</span>
            <span className="text-text-muted">{ratingSummary.count} avaliações</span>
          </div>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <li key={testimonial.name} className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm">
              <p className="text-text-muted">“{testimonial.quote}”</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/30" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-text-muted">{testimonial.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
