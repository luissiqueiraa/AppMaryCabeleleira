import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiSearch, FiChevronDown, FiCheck } from "react-icons/fi";

export default function AutocompleteFilter({ options, value, onChange, placeholder = "Filtrar...", ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const listboxId = useId();

  const selectedOption = options.find((option) => option.id === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  function handleSelect(option) {
    onChange(option.id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-64">
      <div className="relative">
        <FiSearch
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-controls={listboxId}
          autoComplete="off"
          value={open ? query : (selectedOption?.label ?? "")}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-9 pl-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
        />
        <FiChevronDown
          className={`pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400">Nenhum resultado</li>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.id === value;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isSelected ? "bg-pink-50 text-pink-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                    {isSelected && <FiCheck size={14} aria-hidden="true" />}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
