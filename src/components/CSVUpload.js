import { useEffect, useState } from "react";

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
    // Store numeric values in form when unitsData changes
    if (setValue && unitsData.length > 0) {
      unitsData.forEach((unit, index) => {
        const numericGrossArea = typeof unit.grossArea === "number" 
          ? unit.grossArea 
          : parseFloat(String(unit.grossArea).replace(/,/g, "")) || 0;
        const numericPrice = typeof unit.price === "number" 
          ? unit.price 
          : parseFloat(String(unit.price).replace(/,/g, "")) || 0;
        
        setValue(`${name}.${index}.grossArea`, numericGrossArea);
        setValue(`${name}.${index}.price`, numericPrice);
      });
    }
  }, [unitsData, setValue]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split("\n");
      // const headers = lines[0].split(",");

      const data = lines
        .slice(1)
        .filter((line) => line?.trim())
        .map((line) => {
          const values = line?.split(",") || [];
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
        .sort((a, b) => {
          // Sort by unit number (handle both numeric and alphanumeric unit numbers)
          const unitA = a.unitNo;
          const unitB = b.unitNo;
          
          // Try to parse as numbers first
          const numA = parseFloat(unitA);
          const numB = parseFloat(unitB);
          
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          
          // Fall back to string comparison
          return unitA.localeCompare(unitB, undefined, { numeric: true, sensitivity: 'base' });
        });

      setCsvData(data);
      onDataLoad(data);
    };
    reader.readAsText(file);
  };

  const handleCalculate = (index) => {
    if (selectedRow === index) {
      setSelectedRow(0);
      setSelectedUnit(0);
    } else {
      setSelectedRow(index);
      setSelectedUnit(index);
    }
  };

  const handleRemoveCSV = () => {
    setCsvData([]);
    onDataLoad([]);
    setSelectedRow(0);
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
              {csvData.map((row, index) => {
                const numericPrice =
                  typeof row.price === "number"
                    ? row.price
                    : parseFloat(row.price) || 0;
                return (
                  <tr
                  key={index}
                  className={selectedRow === index ? "bg-blue-50" : ""}
                >
                  <td className="border border-gray-300 px-2 py-1">
                    {row.projectName}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      {...register(`${name}.${index}.unitNo`)}
                      defaultValue={row.unitNo}
                      disabled
                      className="w-full border-none outline-none bg-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      {...register(`${name}.${index}.floorNo`)}
                      defaultValue={row.floorNo}
                      disabled
                      className="w-full border-none outline-none bg-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      {...register(`${name}.${index}.unitType`)}
                      defaultValue={row.unitType}
                      disabled
                      className="w-full border-none outline-none bg-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      {...register(`${name}.${index}.view`)}
                      defaultValue={row.view}
                      disabled
                      className="w-full border-none outline-none bg-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="hidden"
                      {...register(`${name}.${index}.grossArea`)}
                      defaultValue={typeof row.grossArea === "number" 
                        ? row.grossArea 
                        : parseFloat(String(row.grossArea).replace(/,/g, "")) || 0}
                    />
                    <input
                      type="text"
                      value={Math.round(
                        typeof row.grossArea === "number" 
                          ? row.grossArea 
                          : parseFloat(String(row.grossArea).replace(/,/g, "")) || 0
                      ).toLocaleString('en-US')}
                      disabled
                      readOnly
                      className="w-full border-none outline-none bg-transparent text-right"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="hidden"
                      {...register(`${name}.${index}.price`)}
                      defaultValue={numericPrice}
                    />
                    <input
                      type="text"
                      value={numericPrice
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      disabled
                      readOnly
                      className="w-full border-none outline-none bg-transparent text-right"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleCalculate(index)}
                      className={`px-2 py-1 text-xs rounded ${
                        selectedRow === index
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {selectedRow === index ? "Remove" : "Calculate"}
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
