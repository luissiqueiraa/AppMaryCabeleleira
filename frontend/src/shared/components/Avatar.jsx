import { FiUser } from "react-icons/fi";
import { resolveAssetUrl } from "../utils/assetUrl";

const PRESETS = { sm: 32, md: 40, lg: 64, xl: 96 };

// Avatar padrão do app: foto real se existir, senão o mesmo ícone de usuário
// usado no cabeçalho — nunca gradiente/iniciais. `size` aceita um preset
// (sm/md/lg/xl) ou um número de pixels para casos específicos.
export default function Avatar({ name, size = "md", avatarUrl }) {
  const px = PRESETS[size] ?? size;
  const iconPx = Math.round(px * 0.45);
  const dim = { width: px, height: px };

  if (avatarUrl) {
    return (
      <img
        src={resolveAssetUrl(avatarUrl)}
        alt=""
        aria-hidden="true"
        style={dim}
        className="inline-flex shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      style={dim}
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500"
      aria-label={name}
      aria-hidden={name ? undefined : "true"}
    >
      <FiUser size={iconPx} aria-hidden="true" />
    </span>
  );
}
