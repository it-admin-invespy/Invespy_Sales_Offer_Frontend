import { formatCurrency, parseNumericValue, formatArea } from "@/lib/utils";
import { useEffect, useState, useCallback, useMemo } from "react";
import { set } from "zod";

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
}) {
  const name = "projects.0.units";
  const [csvData, setCsvData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(0);

  useEffect(() => {
    setCsvData(unitsData);
    if (setValue && unitsData.length > 0) {
      unitsData.forEach((unit, index) => {
        setValue(
          `${name}.${index}.grossArea`,
          parseNumericValue(unit.grossArea)
        );
        setValue(`${name}.${index}.price`, parseNumericValue(unit.price));
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
            return {
              projectName: values[0]?.trim() || "",
              unitNo: values[1]?.trim() || "",
              floorNo: values[2]?.trim() || "",
              unitType: values[3]?.trim() || "",
              view: values[4]?.trim() || "",
              grossArea: parseFloat(values[5]?.trim()) || 0,
              price: parseFloat(values[6]?.trim()) || 0,
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
    setSelectedRow(0);
    document.getElementById("csv-upload").value = "";
  }, [onDataLoad]);

  const tableHeaders = useMemo(
    () => [
      "Project Name",
      "Unit No",
      "Floor No",
      "Unit Type",
      "View",
      "Area (Sq/Ft)",
      "Price (AED)",
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
                const isSelected = selectedRow === index;
                const numericPrice = parseNumericValue(row.price);
                const numericArea = parseNumericValue(row.grossArea);

                return (
                  <tr key={index} className={isSelected ? "bg-blue-50" : ""}>
                    <td className="border border-gray-300 px-2 py-1">
                      {row.projectName}
                    </td>
                    {["unitNo", "floorNo", "unitType", "view"].map((field) => (
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
                        {...register(`${name}.${index}.price`)}
                        defaultValue={numericPrice}
                      />
                      {formatCurrency(row.price)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
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
