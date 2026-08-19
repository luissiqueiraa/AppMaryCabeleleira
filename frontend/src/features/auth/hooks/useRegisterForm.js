import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { register } from "../services/authService";
import { isPasswordValid } from "../utils/passwordPolicy";
import { maskBrazilianPhone } from "../utils/phoneMask";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_PATTERN = /^\d{10,11}$/;

const INITIAL_VALUES = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  referralSource: "",
  termsAccepted: false,
};

function validate(values, t) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = t("errors.fullNameRequired");

  if (!values.email.trim()) {
    errors.email = t("errors.emailRequired");
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = t("errors.emailInvalid");
  }

  const phoneDigits = values.phoneNumber.replace(/\D/g, "");
  if (!phoneDigits) {
    errors.phoneNumber = t("errors.phoneRequired");
  } else if (!PHONE_DIGITS_PATTERN.test(phoneDigits)) {
    errors.phoneNumber = t("errors.phoneInvalid");
  }

  if (!values.password) {
    errors.password = t("errors.passwordRequired");
  } else if (!isPasswordValid(values.password)) {
    errors.password = t("errors.passwordWeak");
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = t("errors.confirmPasswordRequired");
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = t("errors.confirmPasswordMismatch");
  }

  if (!values.termsAccepted) errors.termsAccepted = t("errors.termsRequired");

  return errors;
}

export function useRegisterForm() {
  const { t } = useTranslation("register");
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    let nextValue = type === "checkbox" ? checked : value;
    if (name === "phoneNumber") nextValue = maskBrazilianPhone(nextValue);

    const nextValues = { ...values, [name]: nextValue };
    setValues(nextValues);
    if (touched[name]) setErrors(validate(nextValues, t));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(values, t));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });
    setFormError("");

    const validationErrors = validate(values, t);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("loading");
    try {
      await register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.replace(/\D/g, ""),
        password: values.password,
        confirmPassword: values.confirmPassword,
        referralSource: values.referralSource || undefined,
      });
      setStatus("success");
      navigate("/login");
    } catch {
      setStatus("error");
      setFormError(t("errors.submitFailed"));
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
