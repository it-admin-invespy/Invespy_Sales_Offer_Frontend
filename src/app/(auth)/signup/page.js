"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { InputField } from "../../../components/FormComponents";
import { signup } from "./actions";

export default function Page() {
  const [state, signupAction] = useActionState(signup, undefined);

  const { register } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign Up
        </h2>

        <form action={signupAction} className="space-y-4">
          <InputField
            register={register}
            name="firstName"
            placeholder="First Name"
          />
          {state?.errors?.firstName && (
            <p className="text-red-500">{state.errors.firstName}</p>
          )}

          <InputField
            register={register}
            name="lastName"
            placeholder="Last Name"
          />
          {state?.errors?.lastName && (
            <p className="text-red-500">{state.errors.lastName}</p>
          )}

          <InputField
            register={register}
            name="email"
            type="email"
            placeholder="Email"
          />
          {state?.errors?.email && (
            <p className="text-red-500">{state.errors.email}</p>
          )}

          <InputField
            register={register}
            name="password"
            type="password"
            placeholder="Password"
          />
          {state?.errors?.password && (
            <p className="text-red-500">{state.errors.password}</p>
          )}
          <InputField
            register={register}
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
          />
          {state?.errors?.confirmPassword && (
            <p className="text-red-500">{state.errors.confirmPassword}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Sign Up
          </button>

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
