export default function DynamicHeader({ register, name, meta, headerValue }) {
  const headerStyle = {
    fontSize: meta?.styles?.header?.fontSize || "24px",
    fontWeight: meta?.styles?.header?.fontWeight || "700",
    fontFamily: meta?.fonts?.[0] || "inherit",
    backgroundColor: meta?.brandColors || "#007BFF",
  };

  return (
    <div className="border border-gray-200 shadow-sm rounded-lg">
      <input
        {...register(name)}
        defaultValue={headerValue}
        style={headerStyle}
        className="w-full text-white text-center border-none outline-none bg-transparent rounded-lg p-6"
      />
    </div>
  );
}
