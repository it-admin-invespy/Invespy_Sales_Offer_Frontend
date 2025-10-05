import { useState } from "react";

export default function InstallmentCSV({ onDataLoad }) {
  const [csvData, setCsvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const handleUpload = (e) => {
    const fileInput = document.getElementById("installment-csv-upload");
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split("\n");

      const data = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line, index) => {
          const values = line.split(",");
          return {
            id: index,
            installment: values[0]?.trim() || "",
            percentagePayable: values[1]?.trim() || "",
            milestone: values[2]?.trim() || "",
            milestoneDate: values[3]?.trim() || "",
            amount: values[4]?.trim() || "",
          };
        });

      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const handleRemove = () => {
    setCsvData([]);
    setSelectedRows(new Set());
    onDataLoad([]);
    document.getElementById("installment-csv-upload").value = "";
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="installment-csv-upload"
        />
        {csvData.length === 0 ? (
          <button
            type="button"
            onClick={() =>
              document.getElementById("installment-csv-upload").click()
            }
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Choose CSV File
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRemove}
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
                  Installment
                </th>
                <th className="border border-gray-300 px-2 py-1">% Payable</th>
                <th className="border border-gray-300 px-2 py-1">Milestone</th>
                <th className="border border-gray-300 px-2 py-1">
                  Milestone Date
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Amount (AED)
                </th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row) => (
                <tr
                  key={row.id}
                  className={selectedRows.has(row.id) ? "bg-blue-50" : ""}
                >
                  <td className="border border-gray-300 px-2 py-1">
                    {row.installment}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.percentagePayable}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.milestone}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.milestoneDate}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.amount}
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
