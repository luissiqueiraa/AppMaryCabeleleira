import Container from "../ui/Container";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import GradientBlock from "../ui/GradientBlock";
import GlowOrbs from "../ui/GlowOrbs";
import { heroStats } from "../../data/stats";

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden py-16 sm:py-24">
      <GlowOrbs />
      <Container className="relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Badge>Salão premium capilar</Badge>

          <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
            <span className="block">Descubra Sua</span>
            <span className="block font-medium text-primary-light italic">Verdadeira</span>
            <span className="block">Beleza.</span>
          </h1>

          <p className="mt-6 max-w-md text-base text-text-muted">
            Diversidade de serviços de beleza com profissionais especializados, em um ambiente
            projetado para o seu conforto e transformação dos seus sonhos.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button to="/agendar" variant="primary">
              Explorar serviços
            </Button>
            <Button href="#galeria" variant="secondary">
              Ver a galeria
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-2xl font-semibold sm:text-3xl">{stat.value}</dd>
                <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden sm:block" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4 pb-10">
            <GradientBlock from="#f2b8d2" to="#7a1b4d" className="h-48 w-3/4" />
            <GradientBlock from="#1c1014" to="#2e1b22" className="h-36 translate-y-6" />
            <GradientBlock from="#eddfc8" to="#a07b52" className="col-span-2 h-40" />
          </div>

          <div className="absolute bottom-0 left-0 w-56 rounded-lg border border-border bg-surface/90 p-4 text-center shadow-xl backdrop-blur-md">
            <p className="font-display text-lg font-semibold text-primary-light">5K+</p>
            <p className="text-xs text-text-muted">Avaliações 5 estrelas</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
