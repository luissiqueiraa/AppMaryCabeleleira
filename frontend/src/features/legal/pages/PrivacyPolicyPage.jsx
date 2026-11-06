import { Link } from "react-router-dom";
import LegalPage, { LegalList } from "../components/LegalPage";
import { useSalonIdentity } from "../hooks/useSalonIdentity";

// O conteúdo descreve o que este sistema realmente coleta e faz — cada item
// corresponde a um campo do banco ou a uma integração que existe no código.
// Ao mudar coleta de dados, provedor de pagamento ou prazo de guarda,
// atualize aqui e a data de "última atualização".
const ATUALIZADO_EM = "28 de outubro de 2026";

export default function PrivacyPolicyPage() {
  const { nome, email, telefone, endereco } = useSalonIdentity();

  const contato = (
    <p>
      Para falar sobre seus dados, procure {nome}
      {email ? (
        <>
          {" "}pelo e-mail{" "}
          <a href={`mailto:${email}`} className="text-primary-light hover:underline">
            {email}
          </a>
        </>
      ) : null}
      {telefone ? (
        <>
          {" "}ou pelo telefone{" "}
          <a href={`tel:${telefone.replace(/\D/g, "")}`} className="text-primary-light hover:underline">
            {telefone}
          </a>
        </>
      ) : null}
      .
    </p>
  );

  const sections = [
    {
      id: "quem-somos",
      title: "Quem trata seus dados",
      body: (
        <>
          <p>
            Esta política explica como {nome} coleta, usa e guarda informações de quem usa este site
            e o aplicativo de agendamento. O salão é o controlador dos dados, nos termos da Lei
            Geral de Proteção de Dados (Lei 13.709/2018).
          </p>
          {endereco && <p>Endereço: {endereco}.</p>}
          {contato}
        </>
      ),
    },
    {
      id: "dados-coletados",
      title: "Quais dados coletamos",
      body: (
        <>
          <p>
            <strong className="text-text">Quando você cria uma conta:</strong>
          </p>
          <LegalList
            items={[
              "Nome completo, e-mail e telefone.",
              "Senha, guardada apenas de forma cifrada (hash) — nem o salão consegue vê-la.",
              "Foto de perfil, se você enviar uma.",
              "Se entrar com o Google, recebemos do Google seu nome, e-mail e foto da conta.",
            ]}
          />

          <p>
            <strong className="text-text">Quando você agenda:</strong>
          </p>
          <LegalList
            items={[
              "Serviços escolhidos, profissional, data e horário.",
              "Valor e duração do atendimento, congelados no momento do agendamento.",
              "Observações que você escrever para o salão.",
              "Forma de pagamento escolhida e se o pagamento foi confirmado.",
            ]}
          />

          <p>
            <strong className="text-text">Automaticamente, por segurança:</strong>
          </p>
          <LegalList
            items={[
              "Endereço IP e identificação do navegador (user agent) nos registros de auditoria.",
              "Data e hora do último acesso e tentativas de login malsucedidas, para bloquear ataques de força bruta.",
              "Um cookie de sessão que mantém você conectada entre visitas.",
            ]}
          />
        </>
      ),
    },
    {
      id: "pagamentos",
      title: "Pagamentos",
      body: (
        <>
          <p>
            Pagamentos por pix e cartão são processados pelo <strong className="text-text">Mercado Pago</strong>.
            Você é levada ao ambiente deles para pagar, e <strong className="text-text">dados de cartão
            nunca passam pelos nossos servidores</strong> — não armazenamos número, validade nem código de
            segurança.
          </p>
          <p>
            Do pagamento, guardamos apenas o valor, a forma escolhida, a situação (pago, pendente ou
            recusado) e o identificador da transação no provedor, para conferência e suporte. O
            tratamento dos dados pelo Mercado Pago segue a política de privacidade deles.
          </p>
          <p>Quando o pagamento é feito no salão, nada disso é coletado: a equipe apenas registra que recebeu.</p>
        </>
      ),
    },
    {
      id: "uso",
      title: "Para que usamos",
      body: (
        <LegalList
          items={[
            "Realizar e organizar seus agendamentos, e avisar você sobre confirmações, remarcações e cancelamentos.",
            "Permitir que a equipe do salão prepare o atendimento e o histórico de serviços.",
            "Processar e confirmar pagamentos.",
            "Proteger a conta contra acesso indevido e investigar problemas de segurança.",
            "Cumprir obrigações legais e fiscais ligadas aos serviços prestados.",
          ]}
        />
      ),
    },
    {
      id: "compartilhamento",
      title: "Com quem compartilhamos",
      body: (
        <>
          <p>Seus dados não são vendidos nem cedidos para publicidade. Eles são compartilhados apenas com:</p>
          <LegalList
            items={[
              "Mercado Pago, para processar pagamentos online.",
              "Google/Firebase, se você optar por entrar com a conta Google.",
              "A equipe do salão, no que é necessário para atender você.",
              "Autoridades, quando houver obrigação legal ou ordem judicial.",
            ]}
          />
        </>
      ),
    },
    {
      id: "guarda",
      title: "Por quanto tempo guardamos",
      body: (
        <>
          <p>
            Mantemos seus dados enquanto sua conta existir. Ao excluir a conta pelo aplicativo, ela é
            desativada imediatamente e você perde o acesso, mas{" "}
            <strong className="text-text">o registro permanece em nossa base</strong> pelo tempo necessário
            para cumprir obrigações fiscais e contábeis e para preservar o histórico de atendimentos e
            pagamentos já realizados.
          </p>
          <p>
            Se quiser a eliminação definitiva dos dados que não precisamos guardar por lei, peça pelos
            canais de contato e faremos a remoção.
          </p>
        </>
      ),
    },
    {
      id: "direitos",
      title: "Seus direitos",
      body: (
        <>
          <p>Pela LGPD, você pode a qualquer momento:</p>
          <LegalList
            items={[
              "Confirmar que tratamos seus dados e acessá-los.",
              "Corrigir dados incompletos ou desatualizados — nome, telefone e foto você mesma altera em Perfil.",
              "Pedir a eliminação dos dados tratados com base no seu consentimento.",
              "Pedir a portabilidade dos seus dados para outro fornecedor.",
              "Revogar consentimentos, como o de receber lembretes.",
              "Saber com quem compartilhamos seus dados.",
            ]}
          />
          <p>
            No aplicativo você já encontra, em <strong className="text-text">Perfil</strong>: edição de dados
            pessoais, troca de senha, preferências de lembrete e exclusão da conta.
          </p>
        </>
      ),
    },
    {
      id: "seguranca",
      title: "Segurança",
      body: (
        <LegalList
          items={[
            "Senhas são guardadas com hash bcrypt, nunca em texto puro.",
            "O acesso é por sessão autenticada, com renovação por token e bloqueio temporário após várias tentativas erradas.",
            "Cada ação sensível da equipe fica registrada em trilha de auditoria.",
            "O acesso aos dados é limitado conforme a função de cada pessoa do salão.",
          ]}
        />
      ),
    },
    {
      id: "menores",
      title: "Menores de idade",
      body: (
        <p>
          O cadastro é destinado a maiores de 18 anos. Atendimentos de menores devem ser agendados e
          acompanhados por quem tem a responsabilidade legal sobre eles.
        </p>
      ),
    },
    {
      id: "mudancas",
      title: "Mudanças nesta política",
      body: (
        <>
          <p>
            Se mudarmos a forma como tratamos seus dados, atualizamos esta página e a data no topo.
            Mudanças relevantes serão avisadas no aplicativo.
          </p>
          <p>
            Veja também os{" "}
            <Link to="/terms-of-service" className="text-primary-light hover:underline">
              Termos de Uso
            </Link>
            .
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Política de Privacidade"
      updatedAt={ATUALIZADO_EM}
      sections={sections}
    />
  );
}
