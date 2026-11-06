import { useRef } from "react";
import { FiPhone, FiMail, FiMapPin, FiImage } from "react-icons/fi";
import FormField from "../../../shared/components/FormField";
import { maskBrazilianPhone } from "../../../shared/utils/phoneMask";
import { resolveAssetUrl } from "../../../shared/utils/assetUrl";

export default function SalonIdentityCard({ values, onChange, onLogoChange, isUploadingLogo }) {
  const fileInputRef = useRef(null);

  function handleChange(event) {
    const { name, value } = event.target;
    onChange({ [name]: name === "phone" ? maskBrazilianPhone(value) : value });
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) onLogoChange?.(file);
    event.target.value = "";
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <h3 className="font-display text-lg font-semibold text-gray-900">Identidade do salão</h3>

      <div className="mt-5 grid gap-6 sm:grid-cols-[96px_1fr]">
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">Logotipo</p>
          {values.logoUrl ? (
            <img
              src={resolveAssetUrl(values.logoUrl)}
              alt=""
              aria-hidden="true"
              className="h-20 w-20 rounded-2xl border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
              <FiImage className="text-gray-400" size={28} aria-hidden="true" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingLogo}
            className="mt-2 text-sm font-semibold text-pink-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploadingLogo ? "Enviando..." : "Trocar logo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              id="salon-name"
              name="name"
              label="Nome do salão"
              inputProps={{ value: values.name ?? "", onChange: handleChange }}
            />
          </div>

          <div className="sm:col-span-2">
            <FormField
              id="salon-address"
              name="address"
              label="Endereço"
              icon={FiMapPin}
              inputProps={{ value: values.address ?? "", onChange: handleChange }}
            />
          </div>

          <FormField
            id="salon-phone"
            name="phone"
            label="Telefone"
            type="tel"
            icon={FiPhone}
            inputProps={{ value: values.phone ?? "", onChange: handleChange }}
          />
          <FormField
            id="salon-email"
            name="email"
            label="Email"
            type="email"
            icon={FiMail}
            inputProps={{ value: values.email ?? "", onChange: handleChange }}
          />
        </div>
      </div>
    </div>
  );
}
