import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

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
  const payload = token ? await verifyJwt(token) : null;
  const isAuthenticated = Boolean(payload);
  const userRole = String(payload?.role ?? "").toLowerCase();
  const isSubscribed =
    payload?.isSubscribed === true ||
    payload?.subscribed === true ||
    String(payload?.subscription ?? "").toLowerCase() === "premium";

  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  if (authPages.includes(pathname)) {
    if (isAuthenticated) {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin", origin));
      }

      return NextResponse.redirect(new URL("/dashboard/profile", origin));
    }

    return NextResponse.next();
  }

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

  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin should not access user dashboard routes.
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", origin));
    }

    // User-only sections that require active subscription.
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
