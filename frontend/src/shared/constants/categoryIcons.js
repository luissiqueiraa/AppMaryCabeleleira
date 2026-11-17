import {
  FiScissors,
  FiDroplet,
  FiSun,
  FiWind,
  FiHeart,
  FiStar,
  FiSmile,
  FiFeather,
  FiAward,
  FiZap,
  FiEye,
  FiGift,
} from "react-icons/fi";

// Tradução da chave que vem do banco para o componente de ícone, com o nome em
// português para leitor de tela. A lista de chaves aceitas é validada no
// backend (CATEGORY_ICONS em serviceCategories.validator.js): as duas precisam
// andar juntas, senão uma chave válida na API cairia no ícone padrão aqui.
export const CATEGORY_ICONS = {
  scissors: { Icon: FiScissors, label: "Tesoura" },
  droplet: { Icon: FiDroplet, label: "Gota" },
  sun: { Icon: FiSun, label: "Sol" },
  wind: { Icon: FiWind, label: "Vento" },
  heart: { Icon: FiHeart, label: "Coração" },
  star: { Icon: FiStar, label: "Estrela" },
  smile: { Icon: FiSmile, label: "Sorriso" },
  feather: { Icon: FiFeather, label: "Pena" },
  award: { Icon: FiAward, label: "Medalha" },
  zap: { Icon: FiZap, label: "Raio" },
  eye: { Icon: FiEye, label: "Olho" },
  gift: { Icon: FiGift, label: "Presente" },
};

// Ordem de exibição no seletor do painel.
export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export const DEFAULT_CATEGORY_ICON_KEY = "scissors";

// Categoria sem ícone escolhido (ou com chave desconhecida, se o backend
// ganhar uma opção nova antes do frontend) cai na tesoura.
export function categoryIcon(key) {
  return CATEGORY_ICONS[key]?.Icon ?? FiScissors;
}
