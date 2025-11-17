"use client";

import { useEffect, useState } from "react";

export default function InstallmentCSV({ setValue, disabled, price, units }) {
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    setCsvData(units?.[0]?.installments || []);
  }, [units]);

  const handleChooseFile = () => {
    document.getElementById("installment-csv-upload").click();
  };

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
        .filter((line) => line?.trim())
        .map((line) => {
          const values = line?.split(",") || [];
          return {
            installment: values[0]?.trim() || "",
            percentagePayable: values[1]?.trim()?.replace(/[^0-9.]/g, "") || "",
            milestone: values[2]?.trim() || "",
            // milestoneDate: values[3]?.trim() || "",
            total: values[3]?.trim() || "",
          };
        });
      registerUnitInstallments(data);
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const registerUnitInstallments = (data) => {
    units.forEach((element, unitIndex) => {
      data.forEach((row, rowIndex) => {
        const basePath = `projects.0.units.${unitIndex}.installments.${rowIndex}`;
        const values = {
          installment: row?.installment || "",
          percentagePayable: parseFloat(
            row?.percentagePayable?.replace(/[^0-9.]/g, "") || "0"
          ),
          milestone: row?.milestone || "",
          // milestoneDate: row?.milestoneDate || "",
          total:
            (parseFloat(
              row?.percentagePayable?.replace(/[^0-9.]/g, "") || "0"
            ) /
              100) *
            (element?.price || 0),
        };
        Object.entries(values).forEach(([key, value]) => {
          setValue(`${basePath}.${key}`, value);
        });
      });
    });
  };

  const handleRemove = () => {
    setCsvData([]);
    document.getElementById("installment-csv-upload").value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          disabled={disabled}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="installment-csv-upload"
        />
        {csvData.length === 0 ? (
          <button
            type="button"
            disabled={disabled}
            onClick={handleChooseFile}
            className={`${
              disabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white font-medium py-2 px-4 rounded-md transition-colors`}
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
                {/* <th className="border border-gray-300 px-2 py-1">
                  Milestone Date
                </th> */}
                <th className="border border-gray-300 px-2 py-1">
                  Amount (AED)
                </th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.installment}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.percentagePayable}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.milestone}
                  </td>
                  {/* <td className="border border-gray-300 px-2 py-1">
                    {row.milestoneDate}
                  </td> */}
                  <td className="border border-gray-300 px-2 py-1">
                    {`${((row?.percentagePayable || 0) / 100) * (price || 0)}`}
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
