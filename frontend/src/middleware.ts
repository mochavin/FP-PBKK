import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Use jose for JWT verification

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  // Public paths that don't require auth
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")
  ) {
    // If already logged in, redirect to boards
    if (token) {
      return NextResponse.redirect(new URL("/boards", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require auth
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify JWT token
  try {
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
    await jwtVerify(token.value, secret);
    return NextResponse.next();
  } catch (error) {
    // Invalid token - redirect to login
    console.log("Invalid token:", error);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token"); // Properly delete the cookie
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
