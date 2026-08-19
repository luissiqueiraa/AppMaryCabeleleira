export default function FormField({
  id,
  name,
  label,
  type = "text",
  icon: Icon,
  error,
  hint,
  inputProps = {},
}) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          name={name}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          className={`w-full rounded-md border py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100 ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 ${error ? "border-red-300" : "border-gray-200"}`}
          {...inputProps}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
