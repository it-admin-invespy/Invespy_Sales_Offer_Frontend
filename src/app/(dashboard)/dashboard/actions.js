"use server";

import { cookies } from "next/headers";
import axios from "axios";

const getAuthHeaders = async () => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  return { Authorization: `Bearer ${accessToken}` };
};

export async function getSalesOffers() {
  const response = await axios.get(
    `${process.env.BASE_URL}/api/v1/sales-offers`,
    {
      headers: await getAuthHeaders(),
    }
  );
  return response.data.salesOffers;
}

export async function getSalesOfferById(id) {
  try {
    const response = await axios.get(
      `${process.env.BASE_URL}/api/v1/sales-offers/${id}`,
      {
        headers: await getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching sales offer by ID:", error);
    throw error;
  }
}

export async function uploadImage(formData) {
  const response = await axios.post(
    `${process.env.BASE_URL}/api/v1/sales-offers/upload/single`,
    formData,
    {
      headers: {
        ...(await getAuthHeaders()),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function uploadBulkImages(formData) {
  const response = await axios.post(
    `${process.env.BASE_URL}/api/v1/sales-offers/upload/bulk`,
    formData,
    {
      headers: {
        ...(await getAuthHeaders()),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function createSalesOffer(formData) {
  try {
    const response = await axios.post(
      `${process.env.BASE_URL}/api/v1/sales-offers`,
      formData,
      {
        headers: {
          ...(await getAuthHeaders()),
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
