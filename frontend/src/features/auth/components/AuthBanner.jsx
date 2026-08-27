export default function AuthBanner({ quote, author, role, label }) {
  return (
    <div
      className="flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-pink-600 to-fuchsia-900 p-10 text-white"
      role="img"
      aria-label={label}
    >
      <p className="font-display text-3xl leading-tight font-medium">&ldquo;{quote}&rdquo;</p>
      <p className="mt-4 text-sm text-white/80">
        {author} · {role}
      </p>
    </div>
  );
}
