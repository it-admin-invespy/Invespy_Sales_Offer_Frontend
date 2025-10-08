"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSalesOffers } from "./actions";
import { transformSalesOffer } from "@/app/lib/utils";
import { usePDF } from "react-to-pdf";
import SalesOffer from "@/components/SalesOffer";

export default function Page() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewForm, setpreviewForm] = useState(null);
  const router = useRouter();

  const { toPDF, targetRef } = usePDF({
    method: "open",
    filename: "sales-offer.pdf",
    page: { margin: 10, format: "a4" },
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const data = await getSalesOffers();
      console.log("Forms", data);
      setForms(data);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (formId) => {
    router.push(`/sales-form?id=${formId}`);
  };

  const handlePreview = async (data) => {
    const formData = await transformSalesOffer(data);
    console.log("Preview form:", formData);
    setpreviewForm({ ...formData });
    setTimeout(() => toPDF(), 0);
  };

  const handleDelete = (formId) => {
    // Add delete functionality
    console.log("Delete form:", formId);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Sales Forms Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Saved Forms</h2>
          </div>

          <div className="divide-y">
            {forms.map((form) => (
              <div
                key={form.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">
                    {form.project.projectName || "Untitled Form"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(form.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePreview(form)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Preview
                  </button>
                  {/* <button
                    onClick={() => handleDelete(form.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button> */}
                </div>
              </div>
            ))}
          </div>

          {forms.length === 0 && (
            <div className="p-8 text-center text-gray-500">No forms found</div>
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
        }}
        ref={targetRef}
      >
        <SalesOffer salesOfferData={previewForm} selectedUnit={0} />
      </div>
    </>
  );
}
