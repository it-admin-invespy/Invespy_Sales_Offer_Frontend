export function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

export function InputField({ register, name, placeholder, type = "text" }) {
  return (
    <div>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}
