import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import GradientBlock from "../ui/GradientBlock";
import { gallery } from "../../data/gallery";

export default function Gallery() {
  const [featured, ...rest] = gallery;

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
            from={featured.from}
            to={featured.to}
            label={featured.label}
            className="col-span-2 h-64 lg:col-span-1 lg:row-span-2 lg:h-full"
          />
          {rest.map((item) => (
            <GradientBlock key={item.label} from={item.from} to={item.to} label={item.label} className="h-40" />
          ))}
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
