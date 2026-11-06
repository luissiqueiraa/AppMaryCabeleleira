import { Outlet } from "react-router-dom";
import Navbar from "../features/institutional/components/layout/Navbar";
import Footer from "../features/institutional/components/layout/Footer";
import { useHomeContent } from "../features/institutional/hooks/useHomeContent";

// O conteúdo do salão é carregado uma vez aqui e distribuído: o rodapé aparece
// em toda página pública e a home recebe o mesmo dado pelo contexto do Outlet,
// em vez de cada seção pedir o seu.
export default function PublicLayout() {
  const content = useHomeContent();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Navbar />
      <main className="flex-1">
        <Outlet context={content} />
      </main>
      <Footer salon={content.salon} />
    </div>
  );
}
