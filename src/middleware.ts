
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This is a conceptual middleware.
// It checks for a custom header X-Authenticated-User-Email which AppProviders sets after a successful mock login.
async function authenticateRequest(request: NextRequest) {
  const userEmail = request.headers.get('X-Authenticated-User-Email');

  if (userEmail) {
    // In a real system with JWTs, you'd validate the token here.
    // For this mock, the presence of the header (set by a successful client-side mock login) is sufficient.
    return { isAuthenticated: true, user: { email: userEmail } };
  }
  return { isAuthenticated: false, user: null };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all API routes under /api/ except specific public routes
  if (pathname.startsWith('/api/')) {
    const publicApiRoutes = [
      '/api/auth/mock-login', // New public login route
      // Keep other meta routes public if they don't require strict auth yet
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
    if (!authResult.isAuthenticated) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required. No X-Authenticated-User-Email header found or invalid.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const requestHeaders = new Headers(request.headers);
    if(authResult.user?.email) {
        // This header is already set by getAuthHeaders on the client,
        // but we ensure it's correctly passed for server-to-server or direct API calls if any.
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

export const config = {
  matcher: ['/api/:path*'], 
};
