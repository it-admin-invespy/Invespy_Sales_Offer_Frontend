"use client";

import { useRef } from "react";
import Papa from "papaparse";
import DynamicButton from "./DynamicButton";

const fieldMapping = {
  brand_color: "meta.brandColors",
  font_family: "meta.fonts.0",
  project_name: "projects.0.projectName",
  country: "projects.0.country",
  location: "projects.0.location",
  elevation: "projects.0.elevation",
  sales_consultant: "salesConsultant",
  brokerage_agency: "brokerageAgency",
  signature: "customer.name",
  date: "customer.date",
  term1: "extra.termsAndCondition.0",
  term2: "extra.termsAndCondition.1",
  term3: "extra.termsAndCondition.2",
  term4: "extra.termsAndCondition.3",
  term5: "extra.termsAndCondition.4",
  term6: "extra.termsAndCondition.5",
  email_website: "customer.email",
  address: "customer.address",
};

const csvHeaders = Object.keys(fieldMapping).join(",");

const downloadSampleCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ProjectDetailsCSVImport = ({ setValue }) => {
  const csvImportRef = useRef();

  const handleCSVImport = () => {
    csvImportRef.current?.click();
  };

  const handleCSVFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (parsedData) => {
            const details = parsedData.data[0];
            Object.keys(details).forEach((key) => {
              const fieldPath = fieldMapping[key.toLowerCase()];
              if (fieldPath) {
                setValue(fieldPath, details[key]);
              }
            });
          },
        });
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={csvImportRef}
        type="file"
        accept=".csv"
        onChange={handleCSVFileChange}
        className="hidden"
      />
      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
      </div>
      <div className="flex gap-2">
        <DynamicButton
          type="button"
          onClick={handleCSVImport}
          className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
          variant="secondary"
        >
          Import Fields from CSV
        </DynamicButton>
        <DynamicButton
          type="button"
          onClick={() =>
            downloadSampleCSV(csvHeaders, "form-fields-sample.csv")
          }
          className="px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
          variant="primary"
        >
          Download Sample
        </DynamicButton>
      </div>
    </div>
  );
};

export default ProjectDetailsCSVImport;
