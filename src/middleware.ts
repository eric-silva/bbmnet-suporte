
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This is a conceptual middleware.
// In a real app with JWTs, you'd validate the token here.
// For this mock setup, we'll check for a custom header.
async function authenticateRequest(request: NextRequest) {
  const userEmail = request.headers.get('X-User-Email');
  // In a real scenario, you would validate a token (e.g., JWT) here.
  // For this mock, we just check if the email header exists.
  // A more robust mock might involve a shared secret or a mock token.
  if (userEmail) {
    // You could potentially fetch user details from a database here if needed
    // and attach to the request or a new header for downstream use.
    // For now, just knowing the email exists is enough for this mock.
    return { isAuthenticated: true, user: { email: userEmail } };
  }
  return { isAuthenticated: false, user: null };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all API routes under /api/ except /api/auth/* or specific public routes
  if (pathname.startsWith('/api/')) {
    // List public API routes that don't require authentication
    const publicApiRoutes = [
      '/api/auth', // if you had auth specific routes like login/register
      '/api/meta/assignees',
      '/api/meta/environments',
      '/api/meta/origins',
      '/api/ai/suggest-assignee' // Assuming AI suggestion doesn't need strict auth for now
    ];

    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Add user info to headers for API routes to access
    const requestHeaders = new Headers(request.headers);
    if(authResult.user?.email) {
        requestHeaders.set('X-Authenticated-User-Email', authResult.user.email);
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/api/:path*'], // Apply to all API routes
};
