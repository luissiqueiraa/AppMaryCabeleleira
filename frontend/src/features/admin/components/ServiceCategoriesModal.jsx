import { useEffect, useRef, useState } from "react";
import { FiX, FiPlus, FiEdit2, FiTrash2, FiCheck } from "react-icons/fi";
import {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from "../services/serviceCategoryService";
import { useServiceCategories } from "../hooks/useServiceCategories";
import {
  CATEGORY_ICONS,
  CATEGORY_ICON_KEYS,
  DEFAULT_CATEGORY_ICON_KEY,
  categoryIcon,
} from "../../../shared/constants/categoryIcons";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

// Seletor de ícone: grade de botões em vez de <select>, porque a escolha é
// visual — ver o desenho vale mais que ler "tesoura". Implementado como
// radiogroup para o leitor de tela anunciar a opção marcada.
function IconPicker({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Ícone da categoria" className="flex flex-wrap gap-1.5">
      {CATEGORY_ICON_KEYS.map((key) => {
        const { Icon, label } = CATEGORY_ICONS[key];
        const selecionado = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selecionado}
            aria-label={label}
            title={label}
            onClick={() => onChange(key)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              selecionado
                ? "border-pink-600 bg-pink-50 text-pink-600"
                : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
            }`}
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

// Gerência das categorias do catálogo. Fica num modal em cima da tabela de
// serviços porque é ali que a necessidade aparece: a pessoa vai cadastrar um
// serviço, não encontra a categoria e precisa criá-la sem perder o caminho.
export default function ServiceCategoriesModal({ onClose, onChanged }) {
  const dialogRef = useRef(null);
  const toast = useToast();
  const { categories, loadStatus, reload } = useServiceCategories();

  const [novoNome, setNovoNome] = useState("");
  const [novoIcone, setNovoIcone] = useState(DEFAULT_CATEGORY_ICON_KEY);
  const [isSaving, setIsSaving] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editIcone, setEditIcone] = useState(DEFAULT_CATEGORY_ICON_KEY);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function aplicado() {
    reload();
    onChanged?.();
  }

  function abrirEdicao(category) {
    setEditTarget(category);
    setEditNome(category.name);
    setEditIcone(category.icon ?? DEFAULT_CATEGORY_ICON_KEY);
  }

  async function handleCreate(event) {
    event.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;

    setIsSaving(true);
    try {
      await createServiceCategory({ name: nome, icon: novoIcone });
      toast.success("Categoria criada.");
      setNovoNome("");
      setNovoIcone(DEFAULT_CATEGORY_ICON_KEY);
      aplicado();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível criar a categoria agora."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveEdit() {
    const nome = editNome.trim();
    const nomeMudou = nome && nome !== editTarget.name;
    const iconeMudou = editIcone !== (editTarget.icon ?? DEFAULT_CATEGORY_ICON_KEY);

    if (!nomeMudou && !iconeMudou) {
      setEditTarget(null);
      return;
    }

    setIsSaving(true);
    try {
      await updateServiceCategory(editTarget.id, {
        ...(nomeMudou ? { name: nome } : {}),
        ...(iconeMudou ? { icon: editIcone } : {}),
      });
      toast.success("Categoria atualizada.");
      setEditTarget(null);
      aplicado();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível salvar agora."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category) {
    setIsSaving(true);
    try {
      await deleteServiceCategory(category.id);
      toast.success("Categoria excluída.");
      aplicado();
    } catch (err) {
      // O backend recusa excluir categoria com serviço dentro; a mensagem
      // traduzida explica o que fazer antes de tentar de novo.
      toast.error(getErrorMessage(err, "Não foi possível excluir agora."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="categories-title"
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl outline-none sm:max-h-[85vh] sm:max-w-md sm:rounded-lg"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-5">
          <h2 id="categories-title" className="font-display text-lg font-semibold text-gray-900">
            Categorias de serviço
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

        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label htmlFor="nova-categoria" className="mb-1.5 block text-sm font-medium text-gray-700">
                Nova categoria
              </label>
              <input
                id="nova-categoria"
                value={novoNome}
                onChange={(event) => setNovoNome(event.target.value)}
                maxLength={60}
                placeholder="Ex: Depilação"
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium text-gray-700">Ícone na página inicial</p>
              <IconPicker value={novoIcone} onChange={setNovoIcone} />
            </div>

            <button
              type="submit"
              disabled={isSaving || novoNome.trim().length < 2}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlus size={16} aria-hidden="true" />
              Criar categoria
            </button>
          </form>

          {loadStatus === "loading" && <p className="mt-5 text-sm text-gray-500">Carregando...</p>}

          {loadStatus === "error" && (
            <p
              role="alert"
              className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              Não foi possível carregar as categorias agora.
            </p>
          )}

          {loadStatus === "success" && categories.length === 0 && (
            <p className="mt-5 rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Nenhuma categoria ainda. Crie a primeira acima.
            </p>
          )}

          {loadStatus === "success" && categories.length > 0 && (
            <ul className="mt-5 space-y-2">
              {categories.map((category) => {
                const Icon = categoryIcon(category.icon);
                const editando = editTarget?.id === category.id;

                return (
                  <li key={category.id} className="rounded-lg border border-gray-200 px-3 py-2.5">
                    {editando ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={editNome}
                            onChange={(event) => setEditNome(event.target.value)}
                            maxLength={60}
                            aria-label={"Novo nome para " + category.name}
                            className="min-w-0 flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus-visible:border-pink-600"
                          />
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            aria-label="Salvar alterações"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-50"
                          >
                            <FiCheck aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditTarget(null)}
                            aria-label="Cancelar"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                          >
                            <FiX aria-hidden="true" />
                          </button>
                        </div>
                        <IconPicker value={editIcone} onChange={setEditIcone} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                          <Icon size={15} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                          {category.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => abrirEdicao(category)}
                          aria-label={"Editar " + category.name}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <FiEdit2 size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={isSaving}
                          aria-label={"Excluir " + category.name}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <FiTrash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-5 text-xs text-gray-500">
            Uma categoria com serviços dentro não pode ser excluída. Mova os serviços para outra categoria
            antes.
          </p>
        </div>
      </div>
    </div>
  );
}
