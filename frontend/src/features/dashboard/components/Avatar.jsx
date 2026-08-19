import { resolveAssetUrl } from "../../../shared/utils/assetUrl";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Avatar({ name, size = "md", avatarUrl }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl", xl: "h-24 w-24 text-2xl" };

  if (avatarUrl) {
    return (
      <img
        src={resolveAssetUrl(avatarUrl)}
        alt=""
        aria-hidden="true"
        className={`inline-flex shrink-0 rounded-full object-cover ${sizes[size]}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 font-semibold text-white ${sizes[size]}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
