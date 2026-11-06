import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import Photo from "../ui/Photo";
import Reveal from "../ui/Reveal";

// Trabalhos reais do salão. As legendas descrevem o que está na foto, não o
// serviço: o nome do procedimento só entra quando o salão confirmar qual foi.
const TRABALHOS = [
  {
    src: "/galeria/liso-pontas-onduladas.jpg",
    alt: "Cabelo longo escuro com pontas onduladas, visto de costas",
    label: "Pontas onduladas",
    className: "col-span-2 h-72 lg:col-span-1 lg:row-span-2 lg:h-full",
  },
  {
    src: "/galeria/cachos-definidos.jpg",
    alt: "Cabelo preto com cachos definidos, visto de lado",
    label: "Cachos definidos",
    className: "h-44 lg:h-56",
  },
  {
    src: "/galeria/ondulado-volume.jpg",
    alt: "Cabelo preto ondulado com volume, visto de lado",
    label: "Ondulado com volume",
    className: "h-44 lg:h-56",
  },
];

export default function Gallery() {
  return (
    <section id="galeria" className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Nosso portfólio"
            title="Transformações"
            accent="impressionantes."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-2">
          {TRABALHOS.map((trabalho, index) => (
            <Reveal key={trabalho.src} delay={index * 90} className={trabalho.className}>
              {/* O Reveal já leva o tamanho do bloco; a foto preenche. */}
              <Photo {...trabalho} className="h-full w-full" />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button href="https://instagram.com" variant="secondary">
            Ver mais no Instagram
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
