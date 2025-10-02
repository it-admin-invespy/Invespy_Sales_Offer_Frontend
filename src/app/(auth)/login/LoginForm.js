"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { InputField } from "../../../components/FormComponents";
import { login } from "./actions";

export function LoginForm() {
  const [state, loginAction] = useActionState(login, undefined);
  const { register } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form action={loginAction} className="space-y-4">
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

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
      >
        Login
      </button>
      
      <p className="text-center text-gray-600">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
