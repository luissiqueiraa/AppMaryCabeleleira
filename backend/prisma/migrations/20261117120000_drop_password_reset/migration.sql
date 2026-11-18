-- Recuperação de senha removida: nunca houve envio de e-mail, então o token
-- não chegava a ninguém. As colunas saem junto com o código.
ALTER TABLE "users" DROP COLUMN "passwordResetExpiresAt",
DROP COLUMN "passwordResetTokenHash";
