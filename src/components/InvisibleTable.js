"use client";

import { useEffect } from "react";
import { useFieldArray } from "react-hook-form";

export default function InvisibleTable({ register, meta, control }) {
  const name = `extra.breakdown`;
  const headerStyle = {
    backgroundColor: meta?.brandColors || "#007BFF",
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  // Initialize with fixed fields if empty
  // useEffect(() => {
  //   if (fields.length === 0) {
  //     append([
  //       { description: "4% Pre-Registration Charges (DLD Fee)", amount: 0 },
  //       { description: "Admin Fee + VAT", amount: 5250.00 },
  //     ]);
  //   }
  // }, [fields, append]);

  return (
    <div>
      {/* <div>{JSON.stringify(fields)}</div> */}
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
          {fields?.map((field, index) => (
            <tr key={field.id}>
              <td className="p-2 border border-gray-300">
                <input
                  {...register(`${name}.${index}.description`)}
                  defaultValue={field.description ?? ""}
                  // disabled={index < 2}
                  className={`w-full border-none outline-none bg-transparent`}
                />
              </td>
              <td className="p-2 border border-gray-300">
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  {...register(`${name}.${index}.amount`)}
                  defaultValue={
                    field.amount === "" || field.amount == null
                      ? ""
                      : field.amount
                  }
                  className="w-full border-none outline-none bg-transparent"
                />
              </td>
              <td className="p-2 border border-gray-300 text-center">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className={`px-2 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
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
