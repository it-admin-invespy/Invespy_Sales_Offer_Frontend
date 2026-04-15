import { formatCurrency, parseNumericValue, formatArea } from "@/lib/utils";
import { useEffect, useState, useCallback, useMemo } from "react";
import { deleteProjectUnits, deleteUnit } from "@/app/(dashboard)/dashboard/actions";

const sortUnits = (a, b) => {
  const numA = parseFloat(a.unitNo);
  const numB = parseFloat(b.unitNo);

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }

  return a.unitNo.localeCompare(b.unitNo, undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

export default function CSVUpload({
  onDataLoad,
  register,
  setSelectedUnit,
  unitsData = [],
  setValue,
  projectId,
}) {
  const name = "projects.0.units";
  const [csvData, setCsvData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(0);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deletingRowIndex, setDeletingRowIndex] = useState(null);

  useEffect(() => {
    setCsvData(unitsData);
    if (setValue && unitsData.length > 0) {
      unitsData.forEach((unit, index) => {
        setValue(
          `${name}.${index}.grossArea`,
          parseNumericValue(unit.grossArea)
        );
        setValue(`${name}.${index}.price`, parseNumericValue(unit.price));
        setValue(
          `${name}.${index}.originalPrice`,
          parseNumericValue(unit.originalPrice)
        );
      });
    }
  }, [unitsData, setValue, name]);

  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        const data = csv
          .split("\n")
          .slice(1)
          .filter((line) => line?.trim())
          .map((line) => {
            const values = line.split(",");
            const floorAndUnitNo = values[1]?.trim() || "";
            const hasMergedFloorUnit = floorAndUnitNo.includes("/");
            const [floorPart, unitPart] = hasMergedFloorUnit
              ? floorAndUnitNo.split("/")
              : [values[2]?.trim() || "", values[1]?.trim() || ""];
            return {
              projectName: values[0]?.trim() || "",
              floorNo: floorPart?.trim() || "",
              unitNo: unitPart?.trim() || "",
              unitType: hasMergedFloorUnit
                ? values[2]?.trim() || ""
                : values[3]?.trim() || "",
              view: hasMergedFloorUnit
                ? values[3]?.trim() || ""
                : values[4]?.trim() || "",
              grossArea: hasMergedFloorUnit
                ? parseFloat(values[4]?.trim()) || 0
                : parseFloat(values[5]?.trim()) || 0,
              originalPrice: hasMergedFloorUnit
                 && parseFloat(values[5]?.replace(/\D/g, "").trim()) || 0 ,
              price: hasMergedFloorUnit
                ? parseFloat(values[6]?.replace(/\D/g, "").trim()) || 0
                : parseFloat(values[6]?.replace(/\D/g, "").trim()) || 0,
            };
          })
          .sort(sortUnits);

        setCsvData(data);
        onDataLoad(data);
      };
      reader.readAsText(file);
    },
    [onDataLoad]
  );

  const handleCalculate = useCallback(
    (index) => {
      const newIndex = selectedRow === index ? 0 : index;
      setSelectedRow(newIndex);
      setSelectedUnit(newIndex);
      setValue(
        "extra.breakdown.0.amount",
        (csvData[newIndex]?.price || 0) * 0.04
      );
    },
    [selectedRow, setSelectedUnit, setValue, csvData]
  );

  const handleRemoveCSV = useCallback(() => {
    setCsvData([]);
    onDataLoad([]);
    setValue(name, []);
    setSelectedRow(0);
    setSelectedUnit(0);
    setValue("extra.breakdown.0.amount", 0);
    document.getElementById("csv-upload").value = "";
  }, [name, onDataLoad, setSelectedUnit, setValue]);

  const handleDeleteRow = useCallback(
    async (indexToDelete) => {
      const unitToDelete = csvData[indexToDelete];
      const unitLabel = unitToDelete?.unitNo
        ? `unit ${unitToDelete.unitNo}`
        : "this unit";
      const confirmed = window.confirm(
        `Are you sure you want to delete ${unitLabel}?`
      );
      if (!confirmed) return;

      setDeletingRowIndex(indexToDelete);

      try {
        const unitIdToDelete =
          unitToDelete?.unitId || unitToDelete?._id || unitToDelete?.id;

        if (unitIdToDelete) {
          await deleteUnit(unitIdToDelete);
        }

        const updatedCsvData = csvData.filter(
          (_, index) => index !== indexToDelete
        );
        setCsvData(updatedCsvData);
        onDataLoad(updatedCsvData);
        setValue(name, updatedCsvData);

        if (updatedCsvData.length === 0) {
          setSelectedRow(0);
          setSelectedUnit(0);
          setValue("extra.breakdown.0.amount", 0);
          return;
        }

        let nextSelectedRow = selectedRow;
        if (indexToDelete === selectedRow) {
          nextSelectedRow = Math.min(indexToDelete, updatedCsvData.length - 1);
        } else if (indexToDelete < selectedRow) {
          nextSelectedRow = selectedRow - 1;
        }

        setSelectedRow(nextSelectedRow);
        setSelectedUnit(nextSelectedRow);
        setValue(
          "extra.breakdown.0.amount",
          (updatedCsvData[nextSelectedRow]?.price || 0) * 0.04
        );
      } catch (error) {
        console.error("Failed to delete unit:", error);
        alert(error?.message || "Failed to delete unit");
      } finally {
        setDeletingRowIndex(null);
      }
    },
    [csvData, onDataLoad, selectedRow, setSelectedUnit, setValue]
  );

  const clearAllUnits = useCallback(() => {
    setCsvData([]);
    onDataLoad([]);
    setValue(name, []);
    setSelectedRow(0);
    setSelectedUnit(0);
    setValue("extra.breakdown.0.amount", 0);
    document.getElementById("csv-upload").value = "";
  }, [name, onDataLoad, setSelectedUnit, setValue]);

  const handleDeleteAllUnits = useCallback(async () => {
    if (csvData.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${csvData.length} units?`
    );
    if (!confirmed) return;

    if (!projectId) {
      alert("Project ID is missing. Unable to delete all units.");
      return;
    }

    setIsDeletingAll(true);
    try {
      await deleteProjectUnits(projectId);
      clearAllUnits();
    } catch (error) {
      console.error("Failed to delete all units:", error);
      alert(error?.message || "Failed to delete all units");
    } finally {
      setIsDeletingAll(false);
    }
  }, [clearAllUnits, csvData.length, projectId]);

  const tableHeaders = useMemo(
    () => [
      "Project Name",
      "Floor / Unit No",
      "Unit Type",
      "View",
      "Area (Sq/Ft)",
      "Original Price (AED)",
      "Offer Price (AED)",
      "Action",
    ],
    []
  );

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
        <div className="overflow-x-auto h-[500px]">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {tableHeaders.map((header) => (
                  <th key={header} className="border border-gray-300 px-2 py-1">
                    {header === "Action" ? (
                      <div className="flex items-center justify-between gap-2">
                        <span>{header}</span>
                        <button
                          type="button"
                          onClick={handleDeleteAllUnits}
                          disabled={isDeletingAll || csvData.length === 0}
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isDeletingAll ? "Deleting..." : "Delete All"}
                        </button>
                      </div>
                    ) : (
                      header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => {
                const isSelected = selectedRow === index;
                const numericPrice = parseNumericValue(row.price);
                const numericArea = parseNumericValue(row.grossArea);
                const numericOriginalPrice = parseNumericValue(
                  row.originalPrice ?? row.price
                );
                const floorUnitNo = [row.floorNo, row.unitNo]
                  .filter(Boolean)
                  .join("/");

                return (
                  <tr key={index} className={isSelected ? "bg-blue-50" : ""}>
                    <td className="border border-gray-300 px-2 py-1">
                      {row.projectName}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="hidden"
                        {...register(`${name}.${index}.floorNo`)}
                        defaultValue={row.floorNo}
                      />
                      <input
                        type="hidden"
                        {...register(`${name}.${index}.unitNo`)}
                        defaultValue={row.unitNo}
                      />
                      {floorUnitNo}
                    </td>
                    {["unitType", "view"].map((field) => (
                      <td
                        key={field}
                        className="border border-gray-300 px-2 py-1"
                      >
                        <input
                          {...register(`${name}.${index}.${field}`)}
                          defaultValue={row[field]}
                          disabled
                          className="w-full border-none outline-none bg-transparent"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 px-2 py-1 text-right">
                      <input
                        type="hidden"
                        {...register(`${name}.${index}.grossArea`)}
                        defaultValue={numericArea}
                      />
                      {formatArea(row.grossArea)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right">
                      <input
                        type="hidden"
                        {...register(`${name}.${index}.originalPrice`)}
                        defaultValue={numericOriginalPrice}
                      />
                      {formatCurrency(row.originalPrice ?? row.price)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right">
                      <input
                        type="hidden"
                        {...register(`${name}.${index}.price`)}
                        defaultValue={numericPrice}
                      />
                      {formatCurrency(row.price)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCalculate(index)}
                          className={`px-2 py-1 text-xs rounded ${
                            isSelected
                              ? "bg-red-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {isSelected ? "Remove" : "Calculate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(index)}
                          disabled={deletingRowIndex === index || isDeletingAll}
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {deletingRowIndex === index ? "Deleting..." : "Delete"}
                        </button>
                      </div>
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
