"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms");
      const data = await response.json();
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
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
                  {form.projectName || "Untitled Form"}
                </h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(form.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleEdit(form.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {forms.length === 0 && (
          <div className="p-8 text-center text-gray-500">No forms found</div>
        )}
      </div>
    </div>
  );
}
