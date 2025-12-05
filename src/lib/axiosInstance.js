"use server";

import { cookies } from "next/headers";
import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
});

AxiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (accessToken) {
      if (config.headers)
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors here
    return Promise.reject(error);
  }
);

AxiosInstance.interceptors.response.use(
  (response) => {
    console.log("response", response.data);
    // Can be modified response
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.data);
    // Handle response errors here
    return Promise.reject(error);
  }
);

export default AxiosInstance;
