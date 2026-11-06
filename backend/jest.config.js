// O projeto é ESM ("type": "module"), então o Jest roda sem transpilar: os
// testes usam import de verdade. Isso exige a flag --experimental-vm-modules,
// que já está no script "test" do package.json.
export default {
  testEnvironment: "node",
  // Integração usa banco e sobe/zera dados; unidade roda em qualquer máquina.
  testMatch: ["**/tests/**/*.test.js"],
  // Sem transform: nada de babel. Se um dia entrar TypeScript, é aqui que muda.
  transform: {},
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/config/database.js"],
};
