"use server";

import AxiosInstance from "@/app/lib/axiosInstance";

export async function getSalesOffers() {
  const response = await AxiosInstance.get("/api/v1/sales-offers");
  return response.data.salesOffers;
}

export async function getSalesOfferById(id) {
  try {
    const response = await AxiosInstance.get(`/api/v1/sales-offers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales offer by ID:", error);
    throw error;
  }
}

export async function uploadImage(formData) {
  const response = await AxiosInstance.post(
    "/api/v1/sales-offers/upload/single",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function uploadBulkImages(formData) {
  const response = await AxiosInstance.post(
    "/api/v1/sales-offers/upload/bulk",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function createSalesOffer(formData) {
  try {
    const response = await AxiosInstance.post(
      "/api/v1/sales-offers",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating sales offer:", error);
    throw error;
  }
}

export async function deleteSalesOffer(id) {
  try {
    const response = await AxiosInstance.delete(`/api/v1/sales-offers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting sales offer:", error);
    throw error;
  }
}
