"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "./actions";

export default function LoginForm() {
  const { pending } = useFormStatus();
  const [state, loginAction] = useActionState(login, undefined);

  return (
    <form
      action={loginAction}
      className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <input
          id="email"
          name="email"
          placeholder="Email"
          className="w-full"
        />
      </div>
      {state?.errors?.email && <p className="text-red-500">{state.errors.email}</p>}
      <div className="flex flex-col gap-2">
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
        />
      </div>
      {state?.errors?.password && <p className="text-red-500">{state.errors.password}</p>}
      <button
        disabled={pending}
        type="submit"
        className="
          px-4 py-2 
          bg-blue-600 
          text-white 
          font-medium 
          rounded-md 
          shadow-sm 
          hover:bg-blue-700 
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-500 
          focus:ring-offset-2 
          transition
        "
      >
        Login
      </button>
    </form>
  );
}
