"use client";

import { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";

export default function InvisibleTable({
  register,
  meta,
  control,
  breakdown,
  units,
}) {
  const name = `extra.breakdown`;

  const [breakdownRows, setBreakdownRows] = useState([]);

  const { fields, append } = useFieldArray({
    control,
    name,
  });

  useEffect(() => {
    console.log("breakdown", breakdown);
    setBreakdownRows(breakdown);
  }, [breakdown]);

  useEffect(() => {
    units.forEach((element, index) => {
      // Calculate total amount whenever breakdown changes
      const totalAmount = breakdownRows?.reduce((sum, item) => {
        const amount = parseFloat(item?.amount) || 0;
        return sum + amount;
      }, 0);

      // Update the amount field
      register(`projects.0.units.${index}.preRegistrationPayment.totalAmount`, {
        value: totalAmount,
      });
      register(`projects.0.units.${index}.preRegistrationPayment.breakdown`, {
        value: breakdown,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakdown, units]);

  const headerStyle = {
    backgroundColor: meta?.brandColors || "#007BFF",
  };

  return (
    <div>
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
          {fields.map((field, index) => (
            <tr key={field.id}>
              <td className="p-2 border border-gray-300">
                <input
                  {...register(`${name}.${index}.description`)}
                  className="w-full border-none outline-none bg-transparent"
                />
              </td>
              <td className="p-2 border border-gray-300">
                <input
                  type="number"
                  {...register(`${name}.${index}.amount`)}
                  className="w-full border-none outline-none bg-transparent"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() => append({ description: "", amount: "" })}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Row
      </button>
    </div>
  );
}
