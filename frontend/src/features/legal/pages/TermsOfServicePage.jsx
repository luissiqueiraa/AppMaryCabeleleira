import { Link } from "react-router-dom";
import LegalPage, { LegalList } from "../components/LegalPage";
import { useSalonIdentity } from "../hooks/useSalonIdentity";

// As regras aqui descrevem o comportamento real do sistema: reserva só após
// pagamento aprovado no pix/cartão, reserva imediata no presencial, preço
// congelado no agendamento e devolução tratada manualmente pelo salão.
// Ao mudar qualquer uma dessas regras no código, atualize este texto.
const ATUALIZADO_EM = "28 de outubro de 2026";

export default function TermsOfServicePage() {
  const { nome, email, telefone } = useSalonIdentity();

  const sections = [
    {
      id: "aceite",
      title: "Sobre estes termos",
      body: (
        <>
          <p>
            Estes termos valem para o uso do site e do aplicativo de agendamento de {nome}. Ao criar
            uma conta ou marcar um horário, você concorda com eles.
          </p>
          <p>
            O serviço de agendamento é um meio de marcar atendimentos; o atendimento em si é prestado
            presencialmente pelo salão.
          </p>
        </>
      ),
    },
    {
      id: "conta",
      title: "Sua conta",
      body: (
        <>
          <LegalList
            items={[
              "O cadastro exige nome, e-mail e telefone verdadeiros — é por eles que o salão fala com você sobre o seu horário.",
              "A senha precisa ter ao menos 6 caracteres e é pessoal: não compartilhe.",
              "Você também pode entrar com a conta Google.",
              "Após várias tentativas de senha incorretas, o acesso fica bloqueado por alguns minutos, por segurança.",
              "Você pode excluir sua conta a qualquer momento em Perfil, e perde o acesso imediatamente.",
            ]}
          />
          <p>
            O salão pode suspender contas que usem o sistema de forma abusiva, como marcações em
            massa sem intenção de comparecer.
          </p>
        </>
      ),
    },
    {
      id: "agendamento",
      title: "Como funciona o agendamento",
      body: (
        <>
          <LegalList
            items={[
              "Você escolhe um ou mais procedimentos, a profissional, a data e o horário.",
              "O tempo reservado é a soma da duração dos procedimentos escolhidos.",
              "Só aparecem horários livres e dentro do funcionamento do salão: o atendimento precisa começar e terminar antes do fechamento.",
              "O preço e a duração mostrados na hora do agendamento são os que valem para aquele atendimento, mesmo que a tabela do salão mude depois.",
            ]}
          />
          <p>
            O valor é uma estimativa do serviço combinado. Se, no atendimento, for necessário algo
            diferente do que foi marcado, a profissional conversa com você antes.
          </p>
        </>
      ),
    },
    {
      id: "pagamento",
      title: "Pagamento e reserva do horário",
      body: (
        <>
          <p>
            <strong className="text-text">Pagando no salão:</strong> o horário é reservado na hora da
            confirmação e o pagamento acontece presencialmente, depois do atendimento.
          </p>
          <p>
            <strong className="text-text">Pagando por pix ou cartão:</strong> a cobrança é criada primeiro
            e <strong className="text-text">o horário só é reservado quando o pagamento é aprovado</strong>.
            Até lá, ele continua disponível para outras clientes.
          </p>
          <p>
            Se outra pessoa marcar o mesmo horário enquanto o seu pagamento estiver sendo processado, o
            agendamento não é criado e o salão entra em contato para devolver o valor ou remarcar.
            Cobranças por pix têm prazo de validade; vencido o prazo, é preciso escolher o horário de
            novo.
          </p>
          <p>Pagamentos online são processados pelo Mercado Pago. Devoluções são feitas pelo salão, caso a caso.</p>
        </>
      ),
    },
    {
      id: "remarcar",
      title: "Remarcar, cancelar e faltas",
      body: (
        <>
          <LegalList
            items={[
              "Você pode remarcar ou cancelar pelo aplicativo enquanto o atendimento não tiver sido concluído ou cancelado.",
              "Remarcar mantém o agendamento confirmado no novo horário, desde que ele esteja livre e dentro do funcionamento.",
              "Avise com a maior antecedência possível: o horário liberado pode ser aproveitado por outra cliente.",
            ]}
          />
          <p>
            Faltas sem aviso e atrasos que inviabilizem o serviço podem levar o salão a recusar novos
            agendamentos online. Para atendimentos já pagos, a devolução segue a política combinada
            diretamente com o salão.
          </p>
        </>
      ),
    },
    {
      id: "responsabilidades",
      title: "Responsabilidades",
      body: (
        <>
          <LegalList
            items={[
              "Informe à profissional alergias, tratamentos anteriores (como química ou alisamento) e problemas de saúde que afetem o procedimento.",
              "O resultado de procedimentos capilares varia conforme a condição do cabelo de cada pessoa — fotos do portfólio são exemplos de trabalhos feitos, não promessa de resultado idêntico.",
              "O salão pode remarcar um horário em casos excepcionais, como imprevisto com a profissional, avisando você o quanto antes.",
            ]}
          />
          <p>
            O sistema pode ficar temporariamente indisponível por manutenção ou falha técnica. Nesse
            caso, fale com o salão pelos canais de contato.
          </p>
        </>
      ),
    },
    {
      id: "conteudo",
      title: "Conteúdo do site",
      body: (
        <p>
          Textos, marca e fotos de trabalhos publicados são de {nome}. As fotos de clientes são
          publicadas com autorização; se a sua estiver no site e você quiser removê-la, peça pelos
          canais de contato e ela sai.
        </p>
      ),
    },
    {
      id: "mudancas",
      title: "Mudanças e contato",
      body: (
        <>
          <p>
            Estes termos podem ser atualizados. A data no topo indica a última revisão, e mudanças
            relevantes são avisadas no aplicativo.
          </p>
          <p>
            Dúvidas sobre estes termos ou sobre um atendimento: fale com {nome}
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
          <p>
            Sobre dados pessoais, veja a{" "}
            <Link to="/privacy-policy" className="text-primary-light hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Termos"
      title="Termos de Uso"
      updatedAt={ATUALIZADO_EM}
      sections={sections}
    />
  );
}
