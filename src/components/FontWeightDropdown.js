export default function FontWeightDropdown({ register, name }) {
  const weights = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

  return (
    <select
      {...register(name)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">Select Font Weight</option>
      {weights.map((weight) => (
        <option key={weight} value={weight}>
          {weight}
        </option>
      ))}
    </select>
  );
}