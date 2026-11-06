import { useOutletContext } from "react-router-dom";
import Hero from "../components/sections/Hero";
import Partners from "../components/sections/Partners";
import Services from "../components/sections/Services";
import Gallery from "../components/sections/Gallery";
import About from "../components/sections/About";
import Team from "../components/sections/Team";
import Process from "../components/sections/Process";
import CtaFinal from "../components/sections/CtaFinal";

// Serviços, equipe e contato vêm do banco — o que a dona cadastra no painel
// aparece aqui, sem ninguém editar código. O carregamento acontece no
// PublicLayout, que também alimenta o rodapé: uma requisição para a página.
export default function HomePage() {
  const { salon, services, professionals, loadStatus } = useOutletContext();

  return (
    <>
      <Hero />
      <Partners />
      <Services services={services} loadStatus={loadStatus} />
      <Gallery />
      <About />
      <Team professionals={professionals} loadStatus={loadStatus} />
      <Process />
      <CtaFinal salon={salon} />
    </>
  );
}
