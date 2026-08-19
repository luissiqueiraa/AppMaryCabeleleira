import Hero from "../components/sections/Hero";
import Partners from "../components/sections/Partners";
import Services from "../components/sections/Services";
import Gallery from "../components/sections/Gallery";
import About from "../components/sections/About";
import Team from "../components/sections/Team";
import Process from "../components/sections/Process";
import Testimonials from "../components/sections/Testimonials";
import CtaFinal from "../components/sections/CtaFinal";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Partners />
      <Services />
      <Gallery />
      <About />
      <Team />
      <Process />
      <Testimonials />
      <CtaFinal />
    </>
  );
}
