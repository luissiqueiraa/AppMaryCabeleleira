import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Container from "../../institutional/components/ui/Container";

// Casca comum da política e dos termos: mesma tipografia do site, largura de
// leitura confortável e sumário no topo. As duas páginas só entregam seções.
export default function LegalPage({ eyebrow, title, updatedAt, sections }) {
  // Chegar por link do rodapé no meio da home deixaria a leitura começando no
  // meio da página.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          <FiChevronLeft aria-hidden="true" />
          Voltar para o início
        </Link>

        <p className="mt-8 mb-3 text-xs font-semibold tracking-[0.2em] text-primary-light uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl leading-tight font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-text-muted">Última atualização: {updatedAt}</p>

        <nav aria-label="Nesta página" className="mt-10 rounded-lg border border-border bg-surface/70 p-5">
          <p className="text-xs font-semibold tracking-wide text-text uppercase">Nesta página</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-text-muted hover:text-primary-light">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-12">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold sm:text-2xl">
                <span className="text-primary-light">{index + 1}.</span> {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-muted">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </section>
  );
}

// Lista com marcador, repetida nas duas páginas.
export function LegalList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary-light" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

