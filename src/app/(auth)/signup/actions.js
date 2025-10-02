"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import axios from "axios";

const signupSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }).trim(),
    lastName: z.string().min(1, { message: "Last name is required" }).trim(),
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .trim(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function signup(prevState, formData) {
  const result = signupSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, password } = result.data;
  let res = {};

  try {
    res = await axios.post(`${process.env.BASE_URL}/api/v1/auth/register`, {
      firstName,
      lastName,
      email,
      password,
      role: "user",
    });
  } catch (error) {
    console.log(error);
    return {
      errors: {
        email: "Invalid email or password",
      },
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("accessToken", res.data.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  cookieStore.set("refreshToken", res.data.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  cookieStore.set("user", JSON.stringify(res.data.user), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  redirect("/dashboard");
}
