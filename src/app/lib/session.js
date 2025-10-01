import "server-only";
import { cookies } from "next/headers";

export const createSession = async (token) => {
  cookies().set("session", token, {
    httpOnly: true,
    secure: true,
  });
};

export const deleteSession = async () => {
  cookies().delete("session");
};
