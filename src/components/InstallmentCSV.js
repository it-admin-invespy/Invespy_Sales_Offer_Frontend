"use client";

import {
  formatCurrency,
  parsePercentage,
  calculateAmount,
} from "@/app/lib/utils";
import { useEffect, useState, useCallback, useMemo } from "react";

export default function InstallmentCSV({ setValue, disabled, price, units }) {
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    setCsvData(units?.[0]?.installments || []);
  }, [units]);

  const handleChooseFile = useCallback(() => {
    document.getElementById("installment-csv-upload").click();
  }, []);

  const registerUnitInstallments = useCallback(
    (data) => {
      units.forEach((unit, unitIndex) => {
        data.forEach((row, rowIndex) => {
          const basePath = `projects.0.units.${unitIndex}.installments.${rowIndex}`;
          const percentage = parsePercentage(row.percentagePayable);
          const values = {
            installment: row.installment || "",
            percentagePayable: percentage,
            milestone: row.milestone || "",
            total: calculateAmount(percentage, unit.price || 0),
          };
          Object.entries(values).forEach(([key, value]) => {
            setValue(`${basePath}.${key}`, value);
          });
        });
      });
    },
    [units, setValue]
  );

  const handleUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target.result
          .split("\n")
          .slice(1)
          .filter((line) => line?.trim())
          .map((line) => {
            const values = line.split(",");
            return {
              installment: values[0]?.trim() || "",
              percentagePayable:
                values[1]?.trim()?.replace(/[^0-9.]/g, "") || "",
              milestone: values[2]?.trim() || "",
              total: values[3]?.trim() || "",
            };
          });
        registerUnitInstallments(data);
        setCsvData(data);
      };
      reader.readAsText(file);
    },
    [registerUnitInstallments]
  );

  const handleRemove = useCallback(() => {
    setCsvData([]);
    document.getElementById("installment-csv-upload").value = "";
  }, []);

  const tableHeaders = useMemo(
    () => ["Installment", "% Payable", "Milestone", "Amount (AED)"],
    []
  );

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
        <button
          type="button"
          disabled={disabled && csvData.length === 0}
          onClick={csvData.length === 0 ? handleChooseFile : handleRemove}
          className={`${
            csvData.length === 0
              ? disabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
              : "bg-red-500 hover:bg-red-600"
          } text-white font-medium py-2 px-4 rounded-md transition-colors`}
        >
          {csvData.length === 0 ? "Choose CSV File" : "Remove CSV File"}
        </button>
      </div>

      {csvData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {tableHeaders.map((header) => (
                  <th key={header} className="border border-gray-300 px-2 py-1">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => {
                const percentage = parsePercentage(row.percentagePayable);
                const amount = calculateAmount(percentage, price);

                return (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 py-1">
                      {row.installment}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {Math.round(percentage)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {row.milestone}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
