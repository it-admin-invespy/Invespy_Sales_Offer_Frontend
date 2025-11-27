export function SectionCard({ title, children, buttonText, onButtonClick }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
      <div className="flex justify-start gap-3 items-center">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        {buttonText && onButtonClick && (
          <button
            type="button"
            onClick={onButtonClick}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            {buttonText}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function InputField({
  register,
  name,
  placeholder,
  type = "text",
  label,
  required,
  validation = {},
  error,
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        {...register(name, validation)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-invalid={error ? "true" : "false"}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
