"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import ImageUpload from "../../components/ImageUpload";
import ColorPicker from "../../components/ColorPicker";
import FontSizeDropdown from "../../components/FontSizeDropdown";
import FontWeightDropdown from "../../components/FontWeightDropdown";
import FontDropdown from "../../components/FontDropdown";
import CSVUpload from "../../components/CSVUpload";
import BulkImageUpload from "../../components/BulkImageUpload";
import { SectionCard, InputField } from "../../components/FormComponents";

export default function Page() {
  const [selectedCSVData, setSelectedCSVData] = useState([]);
  const [floorPlanImages, setFloorPlanImages] = useState([]);
  const { control, register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      projects: [
        {
          projectName: "",
          location: "",
          country: "",
          units: [
            {
              unitNo: "",
              floorNo: "",
              unitType: "",
              view: "",
              grossArea: "",
              price: "",
              preRegistrationPayment: {
                totalAmount: "",
                breakdown: [{ description: "", amount: "" }],
              },
              installments: [
                {
                  installment: "",
                  percentagePayable: "",
                  milestone: "",
                  milestoneDate: "",
                  total: "",
                },
              ],
              floorPlans: [{ layoutsImages: "  " }],
            },
          ],
        },
      ],
      salesConsultant: "",
      brokerageAgency: "",
      customer: { name: "", date: "" },
      meta: {
        logoUrl: "",
        brandColors: "",
        fonts: [""],
        styles: {
          header: { fontSize: "", fontWeight: "" },
          table: { borderColor: "" },
        },
      },
    },
  });

  const { fields: projectFields, append: addProject } = useFieldArray({
    control,
    name: "projects",
  });

  const onSubmit = (data) => {
    console.log("Form Submitted:", {
      ...data,
      csvData: selectedCSVData,
      floorPlans: floorPlanImages,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 max-w-6xl mx-auto space-y-8 bg-gray-50 min-h-screen"
    >
      <h2 className="text-2xl font-bold text-gray-800">📋 Project Form</h2>

      {/* Meta */}
      <SectionCard title="Meta">
        <div className="grid grid-cols-3 gap-4">
          <ImageUpload
            onUpload={(url) => setValue("meta.logoUrl", url)}
            currentUrl={watch("meta.logoUrl")}
          />
          <ColorPicker
            onChange={(color) => setValue("meta.brandColors", color)}
            value={watch("meta.brandColors")}
          />
          <FontDropdown register={register} name="meta.fonts.0" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FontSizeDropdown
            register={register}
            name="meta.styles.header.fontSize"
          />
          <FontWeightDropdown
            register={register}
            name="meta.styles.header.fontWeight"
          />
          <InputField
            register={register}
            name="meta.styles.table.borderColor"
            placeholder="Table Border Color"
          />
        </div>
      </SectionCard>

      {/* Project Details */}
      <SectionCard title="Project Details">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            register={register}
            name="projectName"
            placeholder="Project Name"
          />
          <InputField
            register={register}
            name="country"
            placeholder="Country"
          />
          <InputField
            register={register}
            name="location"
            placeholder="Location"
          />
          <InputField
            register={register}
            name="elevations"
            placeholder="Elevations"
          />
        </div>
      </SectionCard>

      {/* CSV Upload */}
      <SectionCard title="Project Units">
        <CSVUpload onDataLoad={setSelectedCSVData} />
      </SectionCard>

      {/* {projectFields.map((project, pIndex) => (
        <div
          key={project.id}
          className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-700">
            Project {pIndex + 1}
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <InputField
              register={register}
              name={`projects.${pIndex}.projectName`}
              placeholder="Project Name"
            />
            <InputField
              register={register}
              name={`projects.${pIndex}.location`}
              placeholder="Location"
            />
            <InputField
              register={register}
              name={`projects.${pIndex}.country`}
              placeholder="Country"
            />
          </div>

          <UnitFields control={control} register={register} pIndex={pIndex} />
        </div>
      ))} */}

      {/* Consultant */}
      <SectionCard title="Consultant & Agency">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            register={register}
            name="salesConsultant"
            placeholder="Sales Consultant"
          />
          <InputField
            register={register}
            name="brokerageAgency"
            placeholder="Brokerage Agency"
          />
        </div>
      </SectionCard>

      {/* Bulk Upload Floor Plans */}
      <SectionCard title="Bulk Upload Floor Plans">
        <BulkImageUpload onImagesUpload={setFloorPlanImages} />
      </SectionCard>

      {/* Customer */}
      <SectionCard title="Signature">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            register={register}
            name="customer.name"
            placeholder="Signature Name"
          />
          <InputField
            register={register}
            type="date"
            name="customer.date"
            placeholder="Date"
          />
        </div>
      </SectionCard>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          💾 Save
        </button>
      </div>
    </form>
  );
}

/* --- Units --- */
// function UnitFields({ control, register, pIndex }) {
//   const { fields: unitFields, append: addUnit } = useFieldArray({
//     control,
//     name: `projects.${pIndex}.units`,
//   });

//   return (
//     <div className="space-y-6">
//       {unitFields.map((unit, uIndex) => (
//         <div
//           key={unit.id}
//           className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-4"
//         >
//           <h4 className="text-md font-medium text-gray-600">
//             Unit {uIndex + 1}
//           </h4>
//           <div className="grid grid-cols-3 gap-4">
//             <InputField
//               register={register}
//               name={`projects.${pIndex}.units.${uIndex}.unitNo`}
//               placeholder="Unit No"
//             />
//             <InputField
//               register={register}
//               name={`projects.${pIndex}.units.${uIndex}.floorNo`}
//               placeholder="Floor No"
//             />
//             <InputField
//               register={register}
//               name={`projects.${pIndex}.units.${uIndex}.unitType`}
//               placeholder="Unit Type"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <InputField
//               register={register}
//               name={`projects.${pIndex}.units.${uIndex}.view`}
//               placeholder="View"
//             />
//             <InputField
//               type="number"
//               register={register}
//               name={`projects.${pIndex}.units.${uIndex}.grossArea`}
//               placeholder="Gross Area"
//             />
//           </div>

//           <InputField
//             type="number"
//             register={register}
//             name={`projects.${pIndex}.units.${uIndex}.price`}
//             placeholder="Price"
//           />
//         </div>
//       ))}
//       <button
//         type="button"
//         onClick={() => addUnit({ unitNo: "", floorNo: "" })}
//         className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
//       >
//         ➕ Add Unit
//       </button>
//     </div>
//   );
// }
