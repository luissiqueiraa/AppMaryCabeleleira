import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/useAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Informe seu e-mail.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!values.password) {
    errors.password = "Informe sua senha.";
  }

  return errors;
}

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState({ email: "", password: "", rememberMe: false });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    const nextValues = { ...values, [name]: nextValue };
    setValues(nextValues);
    if (touched[name]) {
      setErrors(validate(nextValues));
    }
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setFormError("");

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("loading");
    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
      });
      setStatus("success");
      const isStaff = user.role?.name === "owner" || user.role?.name === "admin";
      navigate(isStaff ? "/admin" : "/dashboard");
    } catch {
      setStatus("error");
      setFormError("Não foi possível entrar. Verifique seus dados e tente novamente.");
    }
  }

  return {
    values,
    errors,
    touched,
    status,
    formError,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
