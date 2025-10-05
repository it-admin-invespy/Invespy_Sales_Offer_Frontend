import { useState } from "react";

export default function CSVUpload({ onDataLoad }) {
  const [csvData, setCsvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split("\n");
      const headers = lines[0].split(",");

      const data = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line, index) => {
          const values = line.split(",");
          return {
            id: index,
            projectName: values[0]?.trim() || "",
            unitNo: values[1]?.trim() || "",
            floorNo: values[2]?.trim() || "",
            unitType: values[3]?.trim() || "",
            view: values[4]?.trim() || "",
            grossArea: values[5]?.trim() || "",
            price: values[6]?.trim() || "",
          };
        });

      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const handleCalculate = (row) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(row.id)) {
      newSelected.delete(row.id);
    } else {
      newSelected.add(row.id);
    }
    setSelectedRows(newSelected);

    const selectedData = csvData.filter((item) => newSelected.has(item.id));
    onDataLoad(selectedData);
  };

  const handleRemoveCSV = () => {
    setCsvData([]);
    setSelectedRows(new Set());
    onDataLoad([]);
    document.getElementById("csv-upload").value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          id="csv-upload"
        />
        {csvData.length === 0 ? (
          <button
            type="button"
            onClick={() => document.getElementById("csv-upload").click()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Choose CSV File
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRemoveCSV}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Remove CSV File
          </button>
        )}
      </div>

      {csvData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-2 py-1">
                  Project Name
                </th>
                <th className="border border-gray-300 px-2 py-1">Unit No</th>
                <th className="border border-gray-300 px-2 py-1">Floor No</th>
                <th className="border border-gray-300 px-2 py-1">Unit Type</th>
                <th className="border border-gray-300 px-2 py-1">View</th>
                <th className="border border-gray-300 px-2 py-1">
                  Area (Sq/Ft)
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Price (AED)
                </th>
                <th className="border border-gray-300 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row) => (
                <tr
                  key={row.id}
                  className={selectedRows.has(row.id) ? "bg-blue-50" : ""}
                >
                  <td className="border border-gray-300 px-2 py-1">
                    {row.projectName}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.unitNo}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.floorNo}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.unitType}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.view}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.grossArea}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.price}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleCalculate(row)}
                      className={`px-2 py-1 text-xs rounded ${
                        selectedRows.has(row.id)
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {selectedRows.has(row.id) ? "Remove" : "Calculate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
