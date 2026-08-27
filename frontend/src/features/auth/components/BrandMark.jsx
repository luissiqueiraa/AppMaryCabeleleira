export default function BrandMark({ size = "md" }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
  };

  return (
    <img
      src="/Mary_Cabelereira.png"
      alt="MaryCabeleleira"
      className={`shrink-0 rounded-xl object-cover shadow-sm ${sizes[size]}`}
    />
  );
}
