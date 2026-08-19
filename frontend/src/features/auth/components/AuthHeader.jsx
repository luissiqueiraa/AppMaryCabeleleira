import BackButton from "./BackButton";
import BrandMark from "./BrandMark";

export default function AuthHeader() {
  return (
    <div className="mb-8">
      <div className="mb-6 flex lg:hidden">
        <BackButton />
      </div>

      <div className="lg:hidden">
        <BrandMark size="md" />
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <BrandMark size="sm" />
        <span className="font-display text-lg font-medium italic text-gray-900">
          MaryCabeleleira
        </span>
      </div>
    </div>
  );
}
