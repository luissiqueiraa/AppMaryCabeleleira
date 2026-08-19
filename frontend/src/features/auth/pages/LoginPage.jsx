import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import SocialAuthButtons from "../components/SocialAuthButtons";

export default function LoginPage() {
  return (
    <div className="flex border min-h-screen flex-col lg:flex-row lg:items-center">
        <div className="mx-auto w-full max-w-sm my-auto shadow-lg p-10 mx-10">

          <h1 className="font-display text-center text-3xl leading-tight font-semibold text-gray-900 sm:text-4xl">
            Login
          </h1>
          <p className="mt-5 text-sm text-gray-500">
            Entre para gerenciar seus horários e descobrir novos serviços.
          </p>

          <div className="mt-8">
            <LoginForm />
            <SocialAuthButtons />
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Novo por aqui?{" "}
            <Link to="/register" className="font-semibold text-pink-600 hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
    </div>
  );
}
