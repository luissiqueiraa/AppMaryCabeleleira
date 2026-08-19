export default function GlowOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] overflow-hidden"
    >
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute top-16 -right-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}
