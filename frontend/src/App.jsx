import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/routes/AppRoutes";
import { AuthProvider } from "./shared/contexts/AuthProvider";
import { ToastProvider } from "./shared/contexts/ToastProvider";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
