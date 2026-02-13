"use client";

import { formatCurrency, parsePercentage, calculateAmount } from "@/lib/utils";
import { useEffect, useState, useCallback, useMemo } from "react";

export default function InstallmentCSV({ setValue, disabled, price, units }) {
  const [csvData, setCsvData] = useState([]);
  const [hasVatColumn, setHasVatColumn] = useState(false);

  useEffect(() => {
    const installments = units?.[0]?.installments || [];
    setCsvData(installments);
    setHasVatColumn(installments.some((row) => row.vat != null && row.vat !== "" && row.vat > 0));
  }, [units]);

  const handleChooseFile = useCallback(() => {
    document.getElementById("installment-csv-upload").click();
  }, []);

  // const registerUnitInstallments = useCallback(
  //   (data, hasVat) => {
  //     units.forEach((unit, unitIndex) => {
  //       data.forEach((row, rowIndex) => {
  //         const basePath = `projects.0.units.${unitIndex}.installments.${rowIndex}`;
  //         const percentage = parsePercentage(row.percentagePayable);
  //         const amount = calculateAmount(percentage, unit.price || 0);
  //         const vatNum = hasVat ? (parseFloat(row.vat) || 0) : undefined;
  //         const values = {
  //           installment: row.installment || "",
  //           percentagePayable: percentage,
  //           milestone: row.milestone || "",
  //           total: amount,
  //           ...(hasVat && { vat: vatNum }),
  //         };
  //         Object.entries(values).forEach(([key, value]) => {
  //           setValue(`${basePath}.${key}`, value);
  //         });
  //         // if (!hasVat) {
  //         //   setValue(`${basePath}.vat`, undefined);
  //         // }
  //       });
  //     });
  //   },
  //   [units, setValue]
  // );

  const registerUnitInstallments = useCallback(
    (data, hasVat) => {
      units.forEach((unit, unitIndex) => {
        const newInstallments = data.map((row) => {
          const percentage = parsePercentage(row.percentagePayable);
          const amount = calculateAmount(percentage, unit.price || 0);
          const installment = {
            installment: row.installment || "",
            percentagePayable: percentage,
            milestone: row.milestone || "",
            total: amount,
          };
          if (hasVat) {
            installment.vat = parseFloat(row.vat) || 0;
          } 
          return installment;
        });
        setValue(`projects.0.units.${unitIndex}.installments`, newInstallments);
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
        const lines = (event.target.result || "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length === 0) return;
        // lines == ['header' , row1 , row2]
        const headerLine = lines[0];
        const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
        const vatIndex = headers.findIndex((h) => h === "vat");
        // if not found will return -1
        const hasVat = vatIndex >= 0;

        // skipping index 0 which is header 
        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          const row = {
            installment: values[0]?.trim() || "",
            percentagePayable:
              values[1]?.trim()?.replace(/[^0-9.]/g, "") || "",
            milestone: values[2]?.trim() || "",
          };
          if (hasVat && values[vatIndex] != null) {
            row.vat = parseFloat(values[vatIndex].trim()) || 0;
          }
          return row;
        });

        setHasVatColumn(hasVat);
        registerUnitInstallments(data, hasVat);
        setCsvData(data);
      };
      reader.readAsText(file);
    },
    [registerUnitInstallments]
  );

  const handleRemove = useCallback(() => {
    setCsvData([]);
    setHasVatColumn(false);
    document.getElementById("installment-csv-upload").value = "";
  }, []);

  const tableHeaders = useMemo(
    () =>
      hasVatColumn
        ? [
          "Installment",
          "% Payable",
          "Milestone",
          "Amount (AED)",
          "VAT",
          "Amount after VAT",
        ]
        : ["Installment", "% Payable", "Milestone", "Amount (AED)"],
    [hasVatColumn]
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
          className={`${csvData.length === 0
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
                const vat = hasVatColumn ? (parseFloat(row.vat) || 0) : 0;
                const amountAfterVat = amount + vat;

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
                    {hasVatColumn && (
                      <>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          {formatCurrency(vat)}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          {formatCurrency(amountAfterVat)}
                        </td>
                      </>
                    )}
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
