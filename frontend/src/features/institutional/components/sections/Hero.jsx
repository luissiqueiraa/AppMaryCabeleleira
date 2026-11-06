import Container from "../ui/Container";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Photo from "../ui/Photo";

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden py-16 sm:py-24">
      <Container className="relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="animate-reveal">
            <Badge>Salão premium capilar</Badge>
          </div>

          <h1
            className="font-display animate-reveal mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            <span className="block">Descubra Sua</span>
            <span className="block font-medium text-primary-light italic">Verdadeira</span>
            <span className="block">Beleza.</span>
          </h1>

          <p className="animate-reveal mt-6 max-w-md text-base text-text-muted" style={{ animationDelay: "160ms" }}>
            Diversidade de serviços de beleza com profissionais especializados, em um ambiente
            projetado para o seu conforto e transformação dos seus sonhos.
          </p>

          <div className="animate-reveal mt-8 flex flex-wrap gap-4" style={{ animationDelay: "240ms" }}>
            <Button to="/agendar" variant="primary">
              Explorar serviços
            </Button>
            <Button href="#galeria" variant="secondary">
              Ver a galeria
            </Button>
          </div>

        </div>

        <div className="animate-reveal relative hidden sm:block" style={{ animationDelay: "320ms" }}>
          {/* Uma foto grande em vez do mosaico de blocos: é a primeira imagem
              da página e carrega junto com o texto, sem lazy. */}
          <Photo
            src="/galeria/liso-espelhado.jpg"
            alt="Cabelo longo liso com brilho, trabalho do salão"
            className="h-[28rem] w-full pb-0"
            priority
          />
        </div>
      </Container>
    </section>
  );
}
