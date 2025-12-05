"use server";
import AxiosInstance from "../../../lib/axiosInstance";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
  let res = {};

  try {
    res = await AxiosInstance.post(`/api/v1/auth/login`, {
      email,
      password,
    });
  } catch (error) {
    return {
      errors: {
        email: "Invalid email or password",
      },
    };
  }

  if (!res.data?.accessToken || !res.data?.refreshToken) {
    return {
      errors: {
        email: "Login failed. Please try again.",
      },
    };
  }

  try {
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
  } catch (error) {
    return {
      errors: {
        email: "Login failed. Please try again.",
      },
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("user");
  redirect("/login");
}
