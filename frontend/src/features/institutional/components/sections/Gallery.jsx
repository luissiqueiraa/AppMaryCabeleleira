import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import GradientBlock from "../ui/GradientBlock";

export default function Gallery() {
  return (
    <section id="galeria" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Nosso portfólio"
          title="Transformações"
          accent="impressionantes."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <GradientBlock
            label="Loiro pérola"
            className="col-span-2 h-64 lg:col-span-1 lg:row-span-2 lg:h-full"
          />
          <GradientBlock label="Nail art" className="h-40" />
          <GradientBlock label="Lavanda" className="h-40" />
          <GradientBlock label="Liso seda" className="h-40" />
          <GradientBlock label="Selagem ouro" className="h-40" />
        </div>

        <div className="mt-10 text-center">
          <Button href="https://instagram.com" variant="secondary">
            Ver mais no @marycabeleleira
          </Button>
        </div>
      </Container>
    </section>
  );
}
