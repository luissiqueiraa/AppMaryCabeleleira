import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";

export default function Process() {
  return (
    <section id="agendamento" className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Simples assim" title="Em 4 toques," accent="está agendado." />
        </Reveal>

        <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute top-6 right-0 left-0 hidden h-px bg-border lg:block"
          />
          <Reveal as="li" delay={0} className="relative text-center sm:text-left">
            <span className="font-display relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary-light bg-bg text-lg font-semibold text-primary-light">
              01
            </span>
            <h3 className="mt-4 font-display font-semibold">Escolha o serviço</h3>
            <p className="mt-2 text-sm text-text-muted">
              Navegue pelo catálogo e selecione o que deseja fazer.
            </p>
          </Reveal>
          <Reveal as="li" delay={90} className="relative text-center sm:text-left">
            <span className="font-display relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary-light bg-bg text-lg font-semibold text-primary-light">
              02
            </span>
            <h3 className="mt-4 font-display font-semibold">Escolha a profissional</h3>
            <p className="mt-2 text-sm text-text-muted">
              Selecione a especialista ideal para o seu estilo.
            </p>
          </Reveal>
          <Reveal as="li" delay={180} className="relative text-center sm:text-left">
            <span className="font-display relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary-light bg-bg text-lg font-semibold text-primary-light">
              03
            </span>
            <h3 className="mt-4 font-display font-semibold">Marque a data</h3>
            <p className="mt-2 text-sm text-text-muted">
              Escolha o melhor dia e horário disponível para você.
            </p>
          </Reveal>
          <Reveal as="li" delay={270} className="relative text-center sm:text-left">
            <span className="font-display relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary-light bg-bg text-lg font-semibold text-primary-light">
              04
            </span>
            <h3 className="mt-4 font-display font-semibold">Pronto, é só ir!</h3>
            <p className="mt-2 text-sm text-text-muted">Confirmação imediata, sem complicação.</p>
          </Reveal>
        </ol>
      </Container>
    </section>
  );
}
