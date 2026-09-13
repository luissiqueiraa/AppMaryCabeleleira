import { FiInstagram, FiFacebook, FiMapPin, FiPhone } from "react-icons/fi";
import Container from "../ui/Container";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold">
            MARY<span className="text-primary-light">CABELELEIRA</span>
          </p>
          <p className="mt-3 text-sm text-text-muted">
            Salão de beleza premium dedicado a realçar sua verdadeira beleza.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Instagram" className="text-text-muted hover:text-primary-light">
              <FiInstagram size={20} />
            </a>
            <a href="#" aria-label="Facebook" className="text-text-muted hover:text-primary-light">
              <FiFacebook size={20} />
            </a>
          </div>
        </div>

        <nav aria-label="Serviços">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Serviços</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <a href="#servicos" className="text-sm text-text-muted hover:text-text">
                Cortes
              </a>
            </li>
            <li>
              <a href="#servicos" className="text-sm text-text-muted hover:text-text">
                Coloração
              </a>
            </li>
            <li>
              <a href="#servicos" className="text-sm text-text-muted hover:text-text">
                Progressivas
              </a>
            </li>
            <li>
              <a href="#servicos" className="text-sm text-text-muted hover:text-text">
                Escovas
              </a>
            </li>
            <li>
              <a href="#servicos" className="text-sm text-text-muted hover:text-text">
                Botox & Selagem
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Empresa">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Empresa</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <a href="#sobre" className="text-sm text-text-muted hover:text-text">
                Sobre
              </a>
            </li>
            <li>
              <a href="#equipe" className="text-sm text-text-muted hover:text-text">
                Equipe
              </a>
            </li>
            <li>
              <a href="#depoimentos" className="text-sm text-text-muted hover:text-text">
                Depoimentos
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <FiMapPin className="mt-0.5 shrink-0" aria-hidden="true" />
              R. Caetano Pinto, 415 — São Paulo, SP
            </li>
            <li className="flex items-center gap-2">
              <FiPhone className="shrink-0" aria-hidden="true" />
              (11) 5566-3366
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} MaryCabeleleira. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-text">Política de Privacidade</a>
            <a href="#" className="hover:text-text">Termos de Uso</a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
