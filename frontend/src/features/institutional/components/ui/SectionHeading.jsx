export default function SectionHeading({ eyebrow, title, accent, align = "center" }) {
  const alignment = align === "left" ? "text-left" : "text-center mx-auto";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-primary-light uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {title} <em className="font-medium italic text-primary-light">{accent}</em>
      </h2>
    </div>
  );
}
