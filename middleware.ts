import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if user is authenticated
  const isAuthenticated =
    request.cookies.get("isAuthenticated")?.value === "true" || request.headers.get("x-authenticated") === "true"

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If authenticated and on login page, redirect to home
  if (isAuthenticated && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
