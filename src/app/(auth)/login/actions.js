"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(prevState, formData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  try {
    const res = await fetch(`${process.env.BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    redirect("/sales-form");
  } catch (error) {
    return {
      errors: {
        email: "Invalid email or password",
        password: "XXXXXXX email or password",
      },
    };
  }
}

export async function logout() {
  await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/logout`,
    { method: "POST" }
  );
  redirect("/login");
}
