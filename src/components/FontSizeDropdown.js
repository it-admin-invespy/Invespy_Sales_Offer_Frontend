export default function FontSizeDropdown({ register, name }) {
  const sizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];

  return (
    <select
      {...register(name)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">Select Font Size</option>
      {sizes.map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  );
}