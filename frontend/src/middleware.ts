import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("SUPABASE_JWT_SECRET environment variable is not set.");
}

const secret = new TextEncoder().encode(JWT_SECRET);

function createRedirect(url: string, request: NextRequest) {
  return NextResponse.redirect(new URL(url, request.url));
}

async function verifyToken(token: string) {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  // Public paths that don't require auth
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")
  ) {
    // If already logged in, redirect to boards
    if (token) {
      return createRedirect("/boards", request);
    }
    return NextResponse.next();
  }

  // Protected routes - require auth
  if (!token) {
    return createRedirect("/login", request);
  }

  // Verify JWT token
  const isValidToken = await verifyToken(token.value);
  if (isValidToken) {
    return NextResponse.next();
  } else {
    const response = createRedirect("/login", request);
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
