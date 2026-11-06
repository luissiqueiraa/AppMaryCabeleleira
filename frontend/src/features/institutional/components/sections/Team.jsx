import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import GradientBlock from "../ui/GradientBlock";
import Reveal from "../ui/Reveal";
import { resolveAssetUrl } from "../../../../shared/utils/assetUrl";

// A equipe vem do banco: quem entra ou sai do salão pelo painel aparece ou
// desaparece daqui. A foto é o avatar que cada profissional já tem na conta;
// quem não tem fica com o bloco neutro até o salão enviar uma.
export default function Team({ professionals = [], loadStatus = "success" }) {
  return (
    <section id="equipe" className="py-20 sm:py-28">
      <Container>
        <Reveal>
        <SectionHeading
          eyebrow="Nossa equipe"
          title="Mãos que sabem"
          accent="exatamente o que fazem."
        />
        </Reveal>

        {loadStatus === "loading" && (
          <p className="mt-12 text-sm text-text-muted">Carregando equipe...</p>
        )}

        {loadStatus !== "loading" && professionals.length === 0 && (
          <p className="mt-12 rounded-lg border border-border bg-surface/70 p-8 text-center text-sm text-text-muted">
            Em breve você conhece nossa equipe por aqui.
          </p>
        )}

        {professionals.length > 0 && (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {professionals.map((professional, index) => {
              const primeiroNome = professional.fullName.split(" ")[0];
              return (
                <Reveal
                  as="li"
                  key={professional.id}
                  delay={index * 80}
                  className="rounded-lg border border-border bg-surface/70 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-primary-light"
                >
                  {professional.avatarUrl ? (
                    <img
                      src={resolveAssetUrl(professional.avatarUrl)}
                      alt={professional.fullName}
                      loading="lazy"
                      className="h-48 w-full rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <GradientBlock className="h-48" label={primeiroNome} />
                  )}

                  <h3 className="mt-4 font-display font-semibold">{professional.fullName}</h3>
                  <p className="text-xs text-text-muted">Profissional do salão</p>

                  {/* Leva a profissional escolhida para dentro do fluxo de
                      agendamento, em vez de começar tudo de novo lá. */}
                  <Button
                    to={`/agendar?profissional=${professional.id}`}
                    variant="secondary"
                    className="mt-4 w-full text-xs"
                  >
                    Agendar com {primeiroNome}
                  </Button>
                </Reveal>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
