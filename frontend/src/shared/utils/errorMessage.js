// O backend responde em inglês (mensagens internas de AppError) — a UI toda
// é em português, então nunca mostramos a string crua pra usuária. Traduz as
// mensagens conhecidas; qualquer coisa fora do dicionário cai no fallback
// genérico em vez de vazar inglês na tela.
const KNOWN_MESSAGES = {
  "Authentication required": "Sua sessão expirou. Faça login novamente.",
  "Insufficient permissions": "Você não tem permissão para fazer isso.",
  "You do not have access to this resource": "Você não tem acesso a este recurso.",
  "Invalid or expired access token": "Sua sessão expirou. Faça login novamente.",
  "Only JPEG, PNG or WEBP images are allowed": "Envie uma imagem JPEG, PNG ou WEBP.",
  "Avatar file is required": "Selecione uma imagem para continuar.",
  "User not found": "Usuária não encontrada.",
  "The owner account cannot be modified": "A conta da proprietária não pode ser alterada.",
  "Role not found": "Função não encontrada.",
  "Only the owner can assign this role": "Só a proprietária pode atribuir essa função.",
  "Email is already in use": "Esse email já está em uso.",
  "Employee role is not configured": "A função de funcionária não está configurada.",
  "This user is already an employee": "Essa usuária já é funcionária.",
  "Employee not found": "Funcionária não encontrada.",
  "Client role is not configured": "A função de cliente não está configurada.",
  "Salon settings are not configured": "As configurações do salão ainda não foram definidas.",
  "Service not found": "Serviço não encontrado.",
  "Invalid credentials": "Email ou senha incorretos.",
  "Account temporarily locked due to multiple failed login attempts":
    "Conta temporariamente bloqueada após várias tentativas. Tente novamente em alguns minutos.",
  "Account is not active": "Esta conta não está ativa.",
  "Refresh token is required": "Sua sessão expirou. Faça login novamente.",
  "Invalid refresh token": "Sua sessão expirou. Faça login novamente.",
  "Refresh token reuse detected, all sessions were revoked":
    "Detectamos uma atividade suspeita e encerramos todas as sessões. Faça login novamente.",
  "Refresh token expired": "Sua sessão expirou. Faça login novamente.",
  "Current password is incorrect": "A senha atual está incorreta.",
  "This account uses Google sign-in": "Esta conta entra pelo Google. Use o botão “Continuar com Google”.",
  "Google sign-in is not configured": "O login com Google ainda não está configurado.",
  "Invalid Google credentials": "Não foi possível validar sua conta do Google. Tente novamente.",
  "Google account has no verified email": "Sua conta do Google precisa ter um email verificado.",
  "Invalid or expired reset token": "Este link de redefinição é inválido ou expirou.",
  "Validation failed": "Verifique os dados informados.",
  "One or more permission keys are invalid": "Uma ou mais permissões informadas são inválidas.",
  "A role with this name already exists": "Já existe uma função com esse nome.",
  "Default roles cannot be renamed": "Funções padrão não podem ser renomeadas.",
  "Default roles cannot be deleted": "Funções padrão não podem ser excluídas.",
  "Cannot delete a role that is still assigned to users": "Não é possível excluir uma função que ainda está em uso.",
  "This professional is not available at the selected time": "Essa profissional não está disponível nesse horário.",
  "Appointment not found": "Agendamento não encontrado.",
  "Appointment must be scheduled in the future": "O agendamento precisa ser para uma data futura.",
  "This appointment can no longer be rescheduled": "Esse agendamento não pode mais ser remarcado.",
  "This appointment can no longer be cancelled": "Esse agendamento não pode mais ser cancelado.",
};

const DEFAULT_FALLBACK = "Não foi possível completar a ação agora. Tente novamente em instantes.";

export function getErrorMessage(error, fallback = DEFAULT_FALLBACK) {
  const raw = error?.response?.data?.message;
  if (!raw) return fallback;
  return KNOWN_MESSAGES[raw] ?? fallback;
}
