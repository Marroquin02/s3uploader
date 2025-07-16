import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const publicRoutes = ["/", "/auth/signin", "/auth/error"];

    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    const userRoles = token.roles || [];

    if (pathname.startsWith("/admin")) {
      if (
        !userRoles.includes("admin") &&
        !userRoles.includes("administrator")
      ) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (pathname.startsWith("/upload")) {
      if (!userRoles.includes("uploader") && !userRoles.includes("admin")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
