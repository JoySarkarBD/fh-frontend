import { getCurrentUserFromTokenAction } from "@/services/auth";
import { jwtVerify, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type JwtPayload = JWTPayload & {
  role?: string;
  isSubscribed?: boolean;
  subscribed?: boolean;
  subscription?: string;
};

const jwtSecret = process.env.JWT_SECRET;
const jwtSecretKey = jwtSecret ? new TextEncoder().encode(jwtSecret) : null;

async function verifyJwt(token: string): Promise<JwtPayload | null> {
  if (!token || !jwtSecretKey) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecretKey, {
      algorithms: ["HS256"],
    });

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  const authPages = ["/login", "/signup"];

  const publicPages = [
    "/",
    "/about",
    "/blog",
    "/contact",
    "/properties",
    "/resources",
    "/services",
  ];

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;

  // Get basic info from JWT first (fast)
  const payload = token ? await verifyJwt(token) : null;
  const isAuthenticated = Boolean(payload);

  // Initialize default values
  let userRole = String(payload?.role ?? "").toLowerCase();
  let isSubscribed = false;

  // If authenticated, get full user data including subscription status
  if (isAuthenticated && token) {
    try {
      // Create a request-like object for the server action
      // We need to pass the token since middleware runs on edge
      const userState = await getCurrentUserFromTokenAction();
      // console.log(userState, "user state get");
      userRole = userState.userRole;
      isSubscribed = userState.isSubscribed;
    } catch (error) {
      console.error("Failed to fetch user state in middleware:", error);
      // Fallback to JWT data if available
      // isSubscribed = payload?.isSubscribed === true;
      isSubscribed =
        payload?.isSubscribed === true ||
        payload?.subscribed === true ||
        String(payload?.subscription ?? "").toLowerCase() === "premium";
    }
  }

  // Public pages - allow access
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Auth pages (login/signup) - redirect if already authenticated
  if (authPages.includes(pathname)) {
    if (isAuthenticated) {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin", origin));
      }
      return NextResponse.redirect(new URL("/dashboard/profile", origin));
    }
    return NextResponse.next();
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/profile", origin));
    }

    return NextResponse.next();
  }

  // Dashboard routes protection
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin should not access user dashboard routes
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", origin));
    }

    // User-only sections that require active subscription
    if (
      pathname.startsWith("/dashboard/main") ||
      pathname.startsWith("/dashboard/tools") ||
      pathname.startsWith("/dashboard/profile/message")
    ) {
      if (!isSubscribed) {
        return NextResponse.redirect(
          new URL("/dashboard/profile/subscription", origin),
        );
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
