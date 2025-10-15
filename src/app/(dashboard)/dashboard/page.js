"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSalesOffers, deleteSalesOffer, createSalesOffer } from "./actions";
import {
  createPayloadForDuplicateObj,
  transformSalesOffer,
} from "@/app/lib/utils";
import { usePDF } from "react-to-pdf";
import SalesOffer from "@/components/SalesOffer";
import DynamicButton from "@/components/DynamicButton";

const HIDDEN_PREVIEW_STYLES = {
  position: "absolute",
  left: "-9999px",
  top: "-9999px",
};

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

  const handlePreview = useCallback(async (data) => {
    const formData = await transformSalesOffer(data);
    console.log("Preview form:", formData);
    setpreviewForm({ ...formData });
    setTimeout(() => toPDF(), 0);
  }, [toPDF]);

  const handleDuplicate = async (formId) => {
    try {
      const form = forms.find((f) => f.id === formId);
      if (!form) return;
      const { id, createdAt, updatedAt, ...formData } = form;
      if (formData?.project?.projectName) {
        formData.project.projectName = `${formData.project.projectName} - Copy`;
      }
      const payload = createPayloadForDuplicateObj(formData);
      if (!payload) {
        console.error("Failed to create payload for duplication");
        return;
      }
      await createSalesOffer(payload);
      fetchForms();
    } catch (error) {
      console.error("Failed to duplicate form:", error);
    }
  };

  const handleDelete = async (formId) => {
    try {
      await deleteSalesOffer(formId);
      setForms(forms.filter((form) => form.id !== formId));
    } catch (error) {
      console.error("Failed to delete form:", error);
    }
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
                    {form?.project?.projectName || "Untitled Form"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {form?.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <DynamicButton
                    onClick={() => handleEdit(form.id)}
                    variant="primary"
                    className="p-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </DynamicButton>
                  <DynamicButton
                    onClick={() => handlePreview(form)}
                    variant="success"
                    className="p-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </DynamicButton>
                  <DynamicButton
                    onClick={() => handleDuplicate(form.id)}
                    variant="secondary"
                    className="p-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </DynamicButton>
                  <DynamicButton
                    onClick={() => handleDelete(form.id)}
                    variant="danger"
                    className="p-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </DynamicButton>
                </div>
              </div>
            ))}
          </div>

          {forms.length === 0 && (
            <div className="p-8 text-center text-gray-500">No forms found</div>
          )}
        </div>
      </div>
      <div style={HIDDEN_PREVIEW_STYLES} ref={targetRef}>
        <SalesOffer salesOfferData={previewForm} selectedUnit={0} />
      </div>
    </>
  );
}
