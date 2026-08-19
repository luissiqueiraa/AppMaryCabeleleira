import { HiSparkles } from "react-icons/hi2";

export default function BrandMark({ size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-base",
    md: "h-12 w-12 text-xl",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-sm ${sizes[size]}`}
      aria-hidden="true"
    >
      <HiSparkles />
    </span>
  );
}
