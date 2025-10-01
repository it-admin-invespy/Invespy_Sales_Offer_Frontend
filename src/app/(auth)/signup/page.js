"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { InputField } from "../../../components/FormComponents";

export default function Page() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Sign up successful:", result);
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            register={register}
            name="firstName"
            placeholder="First Name"
          />
          <InputField
            register={register}
            name="lastName"
            placeholder="Last Name"
          />
          <InputField
            register={register}
            name="email"
            type="email"
            placeholder="Email"
          />
          <InputField
            register={register}
            name="password"
            type="password"
            placeholder="Password"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
