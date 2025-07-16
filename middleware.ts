import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    // Obtener el base path de la variable de entorno
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    
    // Remover el base path del pathname para comparación
    const normalizedPath = basePath && pathname.startsWith(basePath) 
      ? pathname.slice(basePath.length) 
      : pathname;

    const publicRoutes = ["/", "/auth/signin", "/auth/error"];

    if (publicRoutes.includes(normalizedPath)) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL(`${basePath}/auth/signin`, req.url));
    }

    const userRoles = token.roles || [];

    if (normalizedPath.startsWith("/admin")) {
      if (
        !userRoles.includes("admin") &&
        !userRoles.includes("administrator")
      ) {
        return NextResponse.redirect(new URL(`${basePath}/unauthorized`, req.url));
      }
    }

    if (normalizedPath.startsWith("/upload")) {
      if (!userRoles.includes("uploader") && !userRoles.includes("admin")) {
        return NextResponse.redirect(new URL(`${basePath}/unauthorized`, req.url));
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
