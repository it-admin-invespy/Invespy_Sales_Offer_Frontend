"use client";

import { useEffect } from "react";
import { useFieldArray, useWatch } from "react-hook-form";

export default function InvisibleTable({
  register,
  meta,
  control,
  autoPreRegFromUnit = true,
  onDisableAutoPreRegFromUnit,
}) {
  const name = `extra.breakdown`;
  const headerStyle = {
    backgroundColor: meta?.brandColors || "#007BFF",
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const breakdownValues = useWatch({ control, name }) || [];

  // If breakdown is empty while auto mode is on (edge case), seed the two default rows.
  useEffect(() => {
    if (!autoPreRegFromUnit || fields.length > 0) return;
    append([
      { description: "4% Pre-Registration Charges (DLD Fee)", amount: 0 },
      { description: "Admin Fee + VAT", amount: 5250 },
    ]);
  }, [autoPreRegFromUnit, fields.length, append]);

  const handleRemoveRow = (index) => {
    if (index === 0) {
      onDisableAutoPreRegFromUnit?.();
    }
    remove(index);
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
            <th
              className="p-2 border border-gray-300 font-semibold text-white"
              style={headerStyle}
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {fields?.map((field, index) => {
            const isAutoDldAmount = autoPreRegFromUnit && index === 0;
            const amountValue = breakdownValues?.[index]?.amount;
            return (
              <tr key={field.id}>
                <td className="p-2 border border-gray-300">
                  <input
                    {...register(`${name}.${index}.description`)}
                    defaultValue={field.description ?? ""}
                    className="w-full border-none outline-none bg-transparent disabled:opacity-70"
                  />
                </td>
                <td className="p-2 border border-gray-300">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...register(`${name}.${index}.amount`)}
                    {...(isAutoDldAmount
                      ? {
                          value:
                            amountValue === "" || amountValue == null
                              ? 0
                              : amountValue,
                        }
                      : {
                          defaultValue:
                            field.amount === "" || field.amount == null
                              ? ""
                              : field.amount,
                        })}
                    disabled={isAutoDldAmount}
                    className="w-full border-none outline-none bg-transparent disabled:opacity-70"
                  />
                </td>
                <td className="p-2 border border-gray-300 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="px-2 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() => append({ description: "", amount: 0 })}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Row
      </button>
    </div>
  );
}
