
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This is a conceptual middleware for the "more real" mock login.
// It checks for a Bearer token.
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const userEmailHeader = request.headers.get('X-Authenticated-User-Email'); // Still useful for identifying user

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove "Bearer "
    // SIMULATED TOKEN VALIDATION - NOT FOR PRODUCTION
    // In a real app, you'd verify the JWT signature, check expiry, etc.
    // For this mock, just checking if token exists and looks like our simulated token.
    if (token.startsWith('simulated-token-')) {
      // If we needed to derive user from token, this is where it'd happen.
      // For now, if token is present and looks okay, and X-Authenticated-User-Email is also present,
      // we'll consider it "authenticated" for API protection.
      return { isAuthenticated: true, userEmail: userEmailHeader };
    }
  }
  return { isAuthenticated: false, userEmail: null };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const publicApiRoutes = [
      '/api/auth/login', // New public login route
      // Keep other meta routes public if they don't require strict auth yet
      // or if they are used by the login page itself before auth.
      '/api/meta/assignees', 
      '/api/meta/environments',
      '/api/meta/origins',
      '/api/meta/priorities',
      '/api/meta/situacoes',
      '/api/meta/tipos',
      '/api/ai/suggest-assignee' 
    ];

    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated || !authResult.userEmail) {
      // More specific error if token was there but X-Authenticated-User-Email was missing.
      let message = 'Authentication required. Missing or invalid token.';
      if (authHeader && authHeader.startsWith('Bearer ') && !authResult.userEmail) {
        message = 'Authentication token present, but user email header missing.'
      }

      return new NextResponse(JSON.stringify({ message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Forward necessary headers
    const requestHeaders = new Headers(request.headers);
    // X-Authenticated-User-Email should already be set by client's getAuthHeaders
    // based on successful login and stored session.
    // Middleware just ensures it's present for protected routes along with a valid token.

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
  }

  return NextResponse.next();
}

export const config = {
  // Ensure this matcher covers all API routes you want to protect,
  // excluding the public ones handled above.
  matcher: ['/api/:path*'], 
};
