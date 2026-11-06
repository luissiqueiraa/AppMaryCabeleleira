// Frontend é ESM (Vite), então o Jest roda os módulos sem transpilar — a flag
// --experimental-vm-modules está no script "test". Por isso os testes cobrem
// os utilitários puros (regras de horário, formatação), que é onde mora a
// lógica de verdade; componentes exigiriam babel para JSX.
export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  clearMocks: true,
  // O fuso precisa ser fixo: as regras de horário do salão são hora de parede,
  // e um teste que passa em São Paulo e falha em CI não serve de rede.
  setupFiles: ["<rootDir>/tests/setup.js"],
};
