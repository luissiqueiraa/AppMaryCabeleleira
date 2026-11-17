import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import FormField from "../../../shared/components/FormField";
import { createService, updateService } from "../services/serviceCatalogService";
import { useServiceCategories } from "../hooks/useServiceCategories";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

export default function ServiceFormModal({ service, onClose, onSaved }) {
  const isEditing = Boolean(service);
  const dialogRef = useRef(null);
  const toast = useToast();

  const { categories, loadStatus: categoriesStatus } = useServiceCategories();

  const [name, setName] = useState(service?.name ?? "");
  // Em serviço novo não há categoria escolhida ainda, e a lista chega depois
  // (vem da API). Fica vazio até lá e o select cai na primeira categoria.
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? "");
  const [duration, setDuration] = useState(service?.duration ?? "");
  const [price, setPrice] = useState(service?.price ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name,
        categoryId: categoryId || categories[0]?.id,
        duration: Number(duration),
        price: Number(price),
      };
      if (isEditing) {
        await updateService(service.id, payload);
        toast.success("Serviço atualizado com sucesso.");
      } else {
        await createService(payload);
        toast.success("Serviço criado com sucesso.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível salvar agora. Tente novamente em instantes."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-form-title"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-lg bg-white shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 id="service-form-title" className="font-display text-lg font-semibold text-gray-900">
            {isEditing ? "Editar serviço" : "Novo serviço"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <FormField
            id="service-name"
            name="name"
            label="Nome do serviço"
            inputProps={{ value: name, onChange: (event) => setName(event.target.value), required: true }}
          />

          <div>
            <label htmlFor="service-category" className="mb-1.5 block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <select
              id="service-category"
              value={categoryId || categories[0]?.id || ""}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={categoriesStatus !== "success" || categories.length === 0}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100 disabled:bg-gray-50 disabled:text-gray-400"
            >
              {categoriesStatus === "loading" ? <option value="">Carregando...</option> : null}
              {categoriesStatus === "error" ? <option value="">Não foi possível carregar</option> : null}
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {categoriesStatus === "success" && categories.length === 0 ? (
              <p className="mt-1.5 text-xs text-gray-500">
                Nenhuma categoria cadastrada. Crie uma em &quot;Gerenciar categorias&quot; antes de cadastrar o
                serviço.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="service-duration"
              name="duration"
              label="Duração (min)"
              type="number"
              inputProps={{
                value: duration,
                onChange: (event) => setDuration(event.target.value),
                min: 5,
                max: 600,
                required: true,
              }}
            />
            <FormField
              id="service-price"
              name="price"
              label="Preço (R$)"
              type="number"
              inputProps={{
                value: price,
                onChange: (event) => setPrice(event.target.value),
                min: 0,
                step: "0.01",
                required: true,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || categories.length === 0}
            className="w-full rounded-lg bg-pink-600 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar serviço"}
          </button>
        </form>
      </div>
    </div>
  );
}
