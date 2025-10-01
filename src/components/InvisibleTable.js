export default function InvisibleTable({ register, meta }) {
  const headerStyle = {
    backgroundColor: meta?.brandColors || "#007BFF",
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <table className="w-full">
        <thead>
          <tr>
            <th
              className="p-2 border border-gray-300 font-semibold text-white"
              style={headerStyle}
            >
              Description
            </th>
            <th
              className="p-2 border border-gray-300 font-semibold text-white"
              style={headerStyle}
            >
              Amount (AED)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border border-gray-300">
              <input
                {...register("table.cell1")}
                className="w-full border-none outline-none bg-transparent"
              />
            </td>
            <td className="p-2 border border-gray-300">
              <input
                {...register("table.cell2")}
                className="w-full border-none outline-none bg-transparent"
              />
            </td>
          </tr>
          <tr>
            <td className="p-2 border border-gray-300">
              <input
                {...register("table.cell3")}
                className="w-full border-none outline-none bg-transparent"
              />
            </td>
            <td className="p-2 border border-gray-300">
              <input
                {...register("table.cell4")}
                className="w-full border-none outline-none bg-transparent"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
