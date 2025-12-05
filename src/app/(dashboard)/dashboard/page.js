"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSalesOffers, deleteSalesOffer, createSalesOffer } from "./actions";
import { createPayloadForDuplicateObj, transformSalesOffer } from "@/lib/utils";
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
      console.log("Fetched forms:", data);
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

  const handlePreview = useCallback(
    async (data) => {
      console.log("Generating preview for data:", data);
      const formData = await transformSalesOffer(data);
      console.log("Preview form:", formData);
      setpreviewForm({ ...formData });
      await new Promise((resolve) => setTimeout(resolve, 300));
      toPDF();
    },
    [toPDF]
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Forms
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forms.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      forms.filter(
                        (f) =>
                          f.createdAt &&
                          new Date(f.createdAt).getMonth() ===
                            new Date().getMonth()
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Forms Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Forms
              </h2>
            </div>

            {forms.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No forms yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Get started by creating your first sales form.
                </p>
                <div className="mt-6">
                  <DynamicButton
                    onClick={() => router.push("/sales-form")}
                    variant="primary"
                    className="px-6 py-3"
                  >
                    Create New Form
                  </DynamicButton>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forms.map((form) => (
                      <tr
                        key={form.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {(form?.project?.projectName || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {form?.project?.projectName || "Untitled Form"}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {form.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {form?.createdAt
                            ? new Date(form.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <DynamicButton
                              onClick={() => handleEdit(form.id)}
                              variant="primary"
                              className="p-2 hover:scale-105 transition-transform"
                              title="Edit"
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
                              className="p-2 hover:scale-105 transition-transform"
                              title="Preview PDF"
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
                              className="p-2 hover:scale-105 transition-transform"
                              title="Duplicate"
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
                              className="p-2 hover:scale-105 transition-transform"
                              title="Delete"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={HIDDEN_PREVIEW_STYLES} ref={targetRef}>
        <SalesOffer salesOfferData={previewForm} selectedUnit={0} />
      </div>
    </>
  );
}
