import GradientBlock from "./GradientBlock";

// Foto real com o mesmo recorte e moldura do GradientBlock, para as seções
// poderem misturar o que já tem imagem com o que ainda não tem sem parecer
// quebrado. Sem src, cai no bloco neutro.
export default function Photo({ src, alt, label, className = "", priority = false }) {
  if (!src) return <GradientBlock className={className} label={label} />;

  return (
    <figure className={`relative overflow-hidden rounded-lg border border-border ${className}`}>
      <img
        src={src}
        alt={alt}
        // A primeira imagem da página entra junto com o resto; as de baixo só
        // quando a visitante chega nelas.
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
      />
      {label && (
        <figcaption className="absolute bottom-3 left-3 rounded-md bg-bg/70 px-3 py-1 text-xs font-medium text-text backdrop-blur-sm">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
