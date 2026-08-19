import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useLoginForm } from "../hooks/useLoginForm";
import FormField from "../../../shared/components/FormField";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {
  const { values, errors, touched, status, formError, handleChange, handleBlur, handleSubmit } =
    useLoginForm();

  const isLoading = status === "loading";

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Formulário de login" className="space-y-4">
      {formError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <FormField
        id="email"
        name="email"
        label="Email"
        type="email"
        icon={FiMail}
        error={touched.email ? errors.email : undefined}
        inputProps={{
          autoComplete: "email",
          maxLength: 120,
          value: values.email,
          onChange: handleChange,
          onBlur: handleBlur,
          placeholder: "seu@email.com",
        }}
      />

      <PasswordInput
        id="password"
        name="password"
        label="Senha"
        error={touched.password ? errors.password : undefined}
        inputProps={{
          autoComplete: "current-password",
          maxLength: 128,
          value: values.password,
          onChange: handleChange,
          onBlur: handleBlur,
          placeholder: "••••••••",
        }}
      />

      <div className="flex items-center justify-end sm:justify-between">
        <label className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
          <input
            type="checkbox"
            name="rememberMe"
            checked={values.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-pink-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          />
          Lembrar de mim
        </label>
        <Link to="/forgot-password" className="text-sm font-medium text-pink-600 hover:underline">
          Esqueci a senha
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
