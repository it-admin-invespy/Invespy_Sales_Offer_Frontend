"use server";

import AxiosInstance from "@/app/lib/axiosInstance";

export async function getSalesOffers() {
  try {
    const response = await AxiosInstance.get("/api/v1/sales-offers");
    return response.data.salesOffers;
  } catch (error) {
    console.error("Error fetching sales offers:", error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sales offers');
  }
}

export async function getSalesOfferById(id) {
  try {
    const response = await AxiosInstance.get(`/api/v1/sales-offers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales offer by ID:", error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sales offer');
  }
}

export async function uploadImage(formData) {
  try {
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
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload image');
  }
}

export async function uploadBulkImages(formData) {
  try {
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
  } catch (error) {
    console.error("Error uploading bulk images:", error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload bulk images');
  }
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
    throw new Error(error.response?.data?.message || error.message || 'Failed to create sales offer');
  }
}

export async function updateSalesOffer(formData, id) {
  try {
    const response = await AxiosInstance.put(
      `/api/v1/sales-offers/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating sales offer:", error.response);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update sales offer');
  }
}

export async function deleteSalesOffer(id) {
  try {
    const response = await AxiosInstance.delete(`/api/v1/sales-offers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting sales offer:", error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete sales offer');
  }
}

export async function deleteS3Image(url) {
  try {
    const response = await AxiosInstance.delete("/api/v1/sales-offers/s3/single", {
      data: { url },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting S3 image:", error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete image');
  }
}

export async function deleteS3Images(urls) {
  try {
    const response = await AxiosInstance.delete("/api/v1/sales-offers/s3/bulk", {
      data: { urls },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting S3 images:", error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete images');
  }
}
