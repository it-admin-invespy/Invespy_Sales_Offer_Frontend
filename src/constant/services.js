"use client";

import axiosClient from "@/lib/axiosClient";
import { API_ENDPOINTS } from "@/constant/api";
import axios from "axios";

export async function uploadBulkImages(formData, projectName) {
    try {
        if (projectName) {
            formData.append("projectName", projectName);
        }

        const response = await axiosClient.post(
            API_ENDPOINTS.UPLOAD.BULK,
            formData,
            {
                timeout: 600000, // 10 minutes
            }
        );

        return response.data;
    } catch (error) {
        console.error("Bulk upload error:", error);
        throw new Error(
            error?.response?.data?.message ||
            error?.message ||
            "Failed to upload bulk images"
        );
    }
}

// export async function uploadBulkImages(formData, projectName) {
//     try {
//         if (projectName) {
//             formData.append("projectName", projectName);
//         }

//         const response = await axios.post(
//             "/api/upload-bulk",
//             formData,
//             {
//                 timeout: 600000, // 10 minutes
//             }
//         );

//         return response;
//     } catch (error) {
//         console.error("Bulk upload error:", error);
//         throw new Error(
//             error?.response?.data?.message ||
//             error?.message ||
//             "Failed to upload bulk images"
//         );
//     }
// }