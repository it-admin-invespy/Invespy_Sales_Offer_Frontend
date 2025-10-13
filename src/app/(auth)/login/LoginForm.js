"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { InputField } from "../../../components/FormComponents";
import DynamicButton from "../../../components/DynamicButton";
import { login } from "./actions";

export function LoginForm() {
  const [state, loginAction, isPending] = useActionState(login, undefined);
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

      <DynamicButton
        type="submit"
        className="w-full"
        variant="primary"
        loading={isPending}
      >
        Login
      </DynamicButton>

      <p className="text-center text-gray-600">
        {`Don't have an account?`}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
