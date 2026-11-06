import { useEffect, useRef, useState } from "react";

// Anima a entrada do bloco quando ele aparece na tela. IntersectionObserver em
// vez de escutar o scroll: o navegador avisa, em vez de calcularmos posição a
// cada pixel rolado.
//
// A animação roda uma vez só — reanimar a cada passagem incomoda quem rola
// para cima e para baixo relendo a página.
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  // Sem suporte (navegador antigo, render sem DOM): nasce visível, sem animar.
  // Decidido no estado inicial, não dentro do efeito: conteúdo não pode
  // depender de um segundo render para aparecer.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      // Dispara um pouco antes de entrar de fato: quando a cliente chega, o
      // bloco já está terminando de aparecer.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={visible && delay ? { animationDelay: `${delay}ms` } : undefined}
      className={`${visible ? "animate-reveal" : "opacity-0"} ${className}`}
    >
      {children}
    </Tag>
  );
}
