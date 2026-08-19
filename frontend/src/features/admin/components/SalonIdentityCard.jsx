import { useState } from "react";
import { FiPhone, FiMail, FiMapPin, FiImage } from "react-icons/fi";
import FormField from "../../../shared/components/FormField";
import { salonIdentity } from "../data/mockAdminSettings";

export default function SalonIdentityCard({ onDirty }) {
  const [values, setValues] = useState(salonIdentity);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    onDirty?.();
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-gray-900">Identidade do salão</h3>

      <div className="mt-5 grid gap-6 sm:grid-cols-[96px_1fr]">
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">Logotipo</p>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
            <FiImage className="text-gray-400" size={28} aria-hidden="true" />
          </div>
          <button type="button" className="mt-2 text-sm font-semibold text-pink-600 hover:underline">
            Trocar logo
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              id="salon-name"
              name="name"
              label="Nome do salão"
              inputProps={{ value: values.name, onChange: handleChange }}
            />
          </div>

          <div className="sm:col-span-2">
            <FormField
              id="salon-address"
              name="address"
              label="Endereço"
              icon={FiMapPin}
              inputProps={{ value: values.address, onChange: handleChange }}
            />
          </div>

          <FormField
            id="salon-phone"
            name="phone"
            label="Telefone"
            type="tel"
            icon={FiPhone}
            inputProps={{ value: values.phone, onChange: handleChange }}
          />
          <FormField
            id="salon-email"
            name="email"
            label="Email"
            type="email"
            icon={FiMail}
            inputProps={{ value: values.email, onChange: handleChange }}
          />
        </div>
      </div>
    </div>
  );
}
