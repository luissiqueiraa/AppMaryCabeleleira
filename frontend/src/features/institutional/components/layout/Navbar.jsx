import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import Button from "../ui/Button";
import Container from "../ui/Container";

const LINKS = [
  { label: "Início", href: "#hero" },
  { label: "Serviços", href: "#servicos" },
  { label: "Galeria", href: "#galeria" },
  { label: "Profissionais", href: "#equipe" },
  { label: "Agendamento", href: "#agendamento" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-lg font-semibold tracking-wide">
          MARY<span className="text-primary-light">CABELELEIRA</span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Entrar
          </Link>
          <Button to="/agendar" variant="primary">
            Agendar horário
          </Button>
        </div>

        <button
          type="button"
          className="text-text lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </Container>

      {open && (
        <nav aria-label="Navegação móvel" className="border-t border-border bg-bg lg:hidden">
          <Container className="flex flex-col gap-4 py-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-muted hover:text-text"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link to="/login" className="text-sm font-medium text-text-muted hover:text-text">
              Entrar
            </Link>
            <Button to="/agendar" variant="primary" className="w-full">
              Agendar horário
            </Button>
          </Container>
        </nav>
      )}
    </header>
  );
}
