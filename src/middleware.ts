import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware function to protect routes and handle authentication
 * 
 * This middleware checks if the requested route is an admin route and,
 * if so, ensures the user is authenticated before allowing access.
 * 
 * @param {NextRequest} request - The incoming request object
 * @returns {NextResponse} The response object that either redirects to sign-in or continues the request
 */
export function middleware(request: NextRequest) {
  // Check if this is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    // For admin routes, check for Better Auth session cookie
    const sessionCookie = request.cookies.get('better-auth.session_token');
    
    if (!sessionCookie) {
      // Redirect to sign in if not authenticated
      return NextResponse.redirect(
        new URL('/auth/sign-in', request.url)
      );
    }
    
    // In a real application, you would also verify that the user has admin privileges
    // This could involve checking a user role in a database or another cookie
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

/**
 * Configuration object for the middleware matcher
 * 
 * @type {Object}
 * @property {Array} matcher - Array of path patterns to apply the middleware to
 * 
 * Matcher patterns:
 * - '/((?!api|_next/static|_next/image|favicon.ico).*)' - Match all paths except API routes and static files
 * - '/admin/:path*' - Specifically protect all admin routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Also protect admin routes specifically
    '/admin/:path*',
  ],
};