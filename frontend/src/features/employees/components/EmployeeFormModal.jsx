import { useEffect, useRef, useState } from "react";
import { FiX, FiUser, FiMail, FiPhone, FiLock, FiSearch, FiUserPlus, FiUserCheck } from "react-icons/fi";
import FormField from "../../../shared/components/FormField";
import Avatar from "../../../shared/components/Avatar";
import { createEmployee, createEmployeeFromUser, updateEmployee, searchUsers } from "../services/employeeService";
import { maskBrazilianPhone } from "../../../shared/utils/phoneMask";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

const NOT_PROMOTABLE_ROLES = new Set(["owner", "employee"]);

export default function EmployeeFormModal({ employee, onClose, onSaved }) {
  const isEditing = Boolean(employee);
  const dialogRef = useRef(null);
  const toast = useToast();

  const [mode, setMode] = useState("new");

  const [fullName, setFullName] = useState(employee?.user.fullName ?? "");
  const [email, setEmail] = useState(employee?.user.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(maskBrazilianPhone(employee?.user.phoneNumber ?? ""));
  const [password, setPassword] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    if (mode !== "existing" || !searchQuery.trim()) return;
    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      searchUsers(searchQuery.trim())
        .then(({ data }) => setSearchResults(data.filter((user) => !NOT_PROMOTABLE_ROLES.has(user.role?.name))))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [mode, searchQuery]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        const digitsOnlyPhone = phoneNumber.replace(/\D/g, "") || undefined;
        await updateEmployee(employee.id, { fullName, email, phoneNumber: digitsOnlyPhone });
        toast.success("Funcionária atualizada com sucesso.");
      } else if (mode === "existing") {
        if (!selectedUser) return;
        await createEmployeeFromUser({ userId: selectedUser.id });
        toast.success(`${selectedUser.fullName} agora é funcionária.`);
      } else {
        const digitsOnlyPhone = phoneNumber.replace(/\D/g, "") || undefined;
        await createEmployee({ fullName, email, phoneNumber: digitsOnlyPhone, password });
        toast.success("Funcionária criada com sucesso.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível salvar agora. Verifique os dados e tente novamente."));
    } finally {
      setIsSaving(false);
    }
  }

  const canSubmit = mode === "existing" ? Boolean(selectedUser) : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-form-title"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-lg bg-white shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 id="employee-form-title" className="font-display text-lg font-semibold text-gray-900">
            {isEditing ? "Editar funcionária" : "Nova funcionária"}
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

        {!isEditing && (
          <div className="flex gap-2 border-b border-gray-100 p-5 pb-0">
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                mode === "new" ? "border-pink-600 text-pink-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiUserPlus size={15} aria-hidden="true" />
              Cadastrar nova
            </button>
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                mode === "existing"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiUserCheck size={15} aria-hidden="true" />
              Usuária existente
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {mode === "existing" && !isEditing ? (
            <>
              <div className="relative">
                <FiSearch
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSelectedUser(null);
                    if (!event.target.value.trim()) setSearchResults([]);
                  }}
                  placeholder="Buscar por nome ou email..."
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pr-3 pl-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
                />
              </div>

              {isSearching && <p className="text-sm text-gray-400">Buscando...</p>}

              {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                <p className="text-sm text-gray-400">Nenhuma usuária encontrada com esse nome ou email.</p>
              )}

              {searchResults.length > 0 && (
                <ul className="max-h-56 space-y-1.5 overflow-y-auto">
                  {searchResults.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                            isSelected ? "border-pink-600 bg-pink-50" : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <Avatar name={user.fullName} size={32} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{user.fullName}</p>
                            <p className="truncate text-xs text-gray-500">{user.email}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

            </>
          ) : (
            <>
              <FormField
                id="employee-name"
                name="fullName"
                label="Nome completo"
                icon={FiUser}
                inputProps={{ value: fullName, onChange: (event) => setFullName(event.target.value), required: true }}
              />
              <FormField
                id="employee-email"
                name="email"
                label="Email"
                type="email"
                icon={FiMail}
                inputProps={{ value: email, onChange: (event) => setEmail(event.target.value), required: true }}
              />
              <FormField
                id="employee-phone"
                name="phoneNumber"
                label="Telefone"
                type="tel"
                icon={FiPhone}
                inputProps={{
                  value: phoneNumber,
                  onChange: (event) => setPhoneNumber(maskBrazilianPhone(event.target.value)),
                }}
              />
              {!isEditing && (
                <FormField
                  id="employee-password"
                  name="password"
                  label="Senha de acesso"
                  type="password"
                  icon={FiLock}
                  hint="Mínimo 6 caracteres."
                  inputProps={{
                    value: password,
                    onChange: (event) => setPassword(event.target.value),
                    required: true,
                    minLength: 6,
                  }}
                />
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSaving || !canSubmit}
            className="w-full rounded-lg bg-pink-600 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : mode === "existing"
                  ? "Adicionar como funcionária"
                  : "Criar funcionária"}
          </button>
        </form>
      </div>
    </div>
  );
}
