"use client"

import axios from "axios"

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    withCredentials: true,                 // ⭐ important
    timeout: 10 * 60 * 1000,               // 10 minutes
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
})

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("error on axiosClient" , error)
        if (error.response?.status === 401 && typeof window !== "undefined") {
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export default axiosClient
