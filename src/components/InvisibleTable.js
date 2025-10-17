"use client";

import { useFieldArray } from "react-hook-form";

export default function InvisibleTable({ register, meta, control }) {
  const name = `extra.breakdown`;
  const headerStyle = {
    backgroundColor: meta?.brandColors || "#007BFF",
  };

  const { fields, append } = useFieldArray({
    control,
    name,
  });

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
          <tr key={`breakdown-${0}`}>
            <td className="p-2 border border-gray-300">
              <input
                {...register(`${name}.0.description`)}
                defaultValue={"4% of Sales Price (DLD FEE)"}
                disabled
                className="w-full border-none outline-none bg-transparent"
              />
            </td>
            <td className="p-2 border border-gray-300">
              <input
                type="number"
                {...register(`${name}.0.amount`)}
                defaultValue={0}
                className="w-full border-none outline-none bg-transparent"
              />
            </td>
          </tr>
          <tr key={`breakdown-${1}`}>
            <td className="p-2 border border-gray-300">
              <input
                {...register(`${name}.1.description`)}
                defaultValue={"Admin Fee + VAT "}
                disabled
                className="w-full border-none outline-none bg-transparent"
              />
            </td>
            <td className="p-2 border border-gray-300">
              <input
                type="number"
                {...register(`${name}.1.amount`)}
                defaultValue={5250}
                className="w-full border-none outline-none bg-transparent"
              />
            </td>
          </tr>
          {/* {fields?.map((field, index) => (
            <tr key={`breakdown-${index}`}>
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
          ))} */}
        </tbody>
      </table>
      {/* <button
        type="button"
        onClick={() => append({ description: "", amount: "" })}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Row
      </button> */}
    </div>
  );
}
