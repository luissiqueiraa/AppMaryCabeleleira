import BrandMark from "../../features/auth/components/BrandMark";
import Spinner from "./Spinner";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white">
      <BrandMark size="md" />
      <Spinner size="lg" />
    </div>
  );
}
