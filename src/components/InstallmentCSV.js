"use client";

import { formatCurrency, parsePercentage, calculateAmount } from "@/lib/utils";
import { useEffect, useState, useCallback, useMemo } from "react";
import { deleteUnitInstallments } from "@/app/(dashboard)/dashboard/actions";

export default function InstallmentCSV({
  setValue,
  disabled,
  price,
  units,
  setUnitsData,
  selectedUnit = 0,
  selectedUnitId = "",
}) {
  const [csvData, setCsvData] = useState([]);
  const [hasVatColumn, setHasVatColumn] = useState(false);
  const [isDeletingAllInstallments, setIsDeletingAllInstallments] = useState(false);

  useEffect(() => {
    const installments = units?.[selectedUnit]?.installments || [];
    setCsvData(installments);
    setHasVatColumn(
      installments.some((row) => row.vat != null && row.vat !== "" && row.vat > 0)
    );
  }, [units, selectedUnit]);

  const handleChooseFile = useCallback(() => {
    document.getElementById("installment-csv-upload").click();
  }, []);

  const registerUnitInstallments = useCallback(
    (data, hasVat) => {
      const buildInstallmentsForUnit = (unitPrice) =>
        data.map((row) => {
          const percentage = parsePercentage(row.percentagePayable);
          const amount = calculateAmount(percentage, unitPrice || 0);
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

      units.forEach((unit, unitIndex) => {
        const newInstallments = buildInstallmentsForUnit(unit.price);
        setValue(`projects.0.units.${unitIndex}.installments`, newInstallments);
      });

      // Keep unitsData synchronized with form values to avoid stale installments on save.
      setUnitsData((prev) =>
        prev.map((unit) => ({
          ...unit,
          installments: buildInstallmentsForUnit(unit.price),
        }))
      );
    },
    [units, setUnitsData, setValue]
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
    try {
      setCsvData([]);
      setHasVatColumn(false);
      // Clear installments in React state

      setUnitsData((prev) => {
        prev.forEach((_, unitIndex) => {
          setValue(`projects.0.units.${unitIndex}.installments`, []);
        });

        return prev.map((project) => ({
          ...project,
          installments: [],
        }));
      });
      const input = document.getElementById("installment-csv-upload");
      if (input) input.value = "";
    } catch (error) {
      console.log("error on removing csv", error)
    }
  }, [setUnitsData, setValue]);

  const handleDeleteAllInstallments = useCallback(async () => {
    if (!selectedUnitId) {
      alert("Unit ID is missing. Unable to delete installments.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete all installments for this unit?"
    );
    if (!confirmed) return;

    setIsDeletingAllInstallments(true);
    try {
      await deleteUnitInstallments(selectedUnitId);
      setCsvData([]);
      setHasVatColumn(false);
      setUnitsData((prev) =>
        prev.map((unit, index) =>
          index === selectedUnit ? { ...unit, installments: [] } : unit
        )
      );
      setValue(`projects.0.units.${selectedUnit}.installments`, []);
    } catch (error) {
      console.error("Failed to delete installments:", error);
      alert(error?.message || "Failed to delete installments");
    } finally {
      setIsDeletingAllInstallments(false);
    }
  }, [selectedUnit, selectedUnitId, setUnitsData, setValue]);

  const tableHeaders = useMemo(
    () =>
      hasVatColumn
        ? [
          "Installment",
          "% Payable",
          "Milestone",
          "Amount (AED)",
          "VAT %",
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
        <button
          type="button"
          onClick={handleDeleteAllInstallments}
          disabled={disabled || isDeletingAllInstallments || !selectedUnitId}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDeletingAllInstallments ? "Deleting..." : "Delete All"}
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
                const amountAfterVat = amount + (amount * vat) / 100;
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
                          {Math.floor(formatCurrency(vat))}
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
