import { useTranslation } from "react-i18next";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useRegisterForm } from "../hooks/useRegisterForm";
import FormField from "../../../shared/components/FormField";
import PasswordInput from "./PasswordInput";
import PasswordStrength from "./PasswordStrength";

export default function RegisterForm() {
  const { t } = useTranslation("register");
  const { values, errors, touched, status, formError, handleChange, handleBlur, handleSubmit } =
    useRegisterForm();

  const isLoading = status === "loading";

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label={t("title")}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      {formError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
          {formError}
        </p>
      )}

      <FormField
        id="fullName"
        name="fullName"
        label={t("fields.fullName.label")}
        icon={FiUser}
        error={touched.fullName ? errors.fullName : undefined}
        inputProps={{
          autoComplete: "name",
          maxLength: 120,
          value: values.fullName,
          onChange: handleChange,
          onBlur: handleBlur,
          placeholder: t("fields.fullName.placeholder"),
        }}
      />

      <FormField
        id="phoneNumber"
        name="phoneNumber"
        label={t("fields.phoneNumber.label")}
        type="tel"
        icon={FiPhone}
        error={touched.phoneNumber ? errors.phoneNumber : undefined}
        inputProps={{
          autoComplete: "tel",
          maxLength: 15,
          value: values.phoneNumber,
          onChange: handleChange,
          onBlur: handleBlur,
          placeholder: t("fields.phoneNumber.placeholder"),
        }}
      />

      <div className="md:col-span-2">
        <FormField
          id="email"
          name="email"
          label={t("fields.email.label")}
          type="email"
          icon={FiMail}
          error={touched.email ? errors.email : undefined}
          inputProps={{
            autoComplete: "email",
            maxLength: 120,
            value: values.email,
            onChange: handleChange,
            onBlur: handleBlur,
            placeholder: t("fields.email.placeholder"),
          }}
        />
      </div>

      <div>
        <PasswordInput
          id="password"
          name="password"
          label={t("fields.password.label")}
          error={touched.password ? errors.password : undefined}
          hint={!touched.password || !errors.password ? t("passwordHint") : undefined}
          inputProps={{
            autoComplete: "new-password",
            maxLength: 128,
            value: values.password,
            onChange: handleChange,
            onBlur: handleBlur,
            placeholder: t("fields.password.placeholder"),
          }}
        />
        <PasswordStrength password={values.password} />
      </div>

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label={t("fields.confirmPassword.label")}
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        inputProps={{
          autoComplete: "new-password",
          maxLength: 128,
          value: values.confirmPassword,
          onChange: handleChange,
          onBlur: handleBlur,
          placeholder: t("fields.confirmPassword.placeholder"),
        }}
      />

      <div className="space-y-2.5 md:col-span-2">
        <label className="flex items-start gap-2.5 text-sm text-gray-600">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={values.termsAccepted}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(touched.termsAccepted && errors.termsAccepted)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-pink-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          />
          <span>
            {t("terms.prefix")}{" "}
            <Link to="/terms-of-service" className="font-medium text-pink-600 hover:underline">
              {t("terms.serviceLink")}
            </Link>{" "}
            {t("terms.middle")}{" "}
            <Link to="/privacy-policy" className="font-medium text-pink-600 hover:underline">
              {t("terms.privacyLink")}
            </Link>
            .
          </span>
        </label>
        {touched.termsAccepted && errors.termsAccepted && (
          <p role="alert" className="text-xs text-red-600">
            {errors.termsAccepted}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
      >
        {isLoading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
