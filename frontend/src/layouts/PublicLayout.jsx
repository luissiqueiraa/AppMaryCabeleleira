import { Outlet } from "react-router-dom";
import Navbar from "../features/institutional/components/layout/Navbar";
import Footer from "../features/institutional/components/layout/Footer";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
