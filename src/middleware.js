import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const protectedRoutes = ["/sales-form", "/"];
const publicRoutes = ["/login"];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const session = (await cookies()).get("session")?.value;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/sales-form", req.nextUrl));
  }

  return NextResponse.next();
}
