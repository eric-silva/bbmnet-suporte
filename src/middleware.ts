
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove "Bearer "
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured on the server.');
      return { isAuthenticated: false, error: 'Server configuration error', status: 500 };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
      // Token is valid, `decoded` contains the payload
      return { isAuthenticated: true, user: decoded };
    } catch (err) {
      // Token is invalid (expired, wrong signature, etc.)
      let message = 'Invalid or expired token.';
      if (err instanceof jwt.TokenExpiredError) {
        message = 'Token expired.';
      } else if (err instanceof jwt.JsonWebTokenError) {
        message = 'Invalid token.';
      }
      return { isAuthenticated: false, error: message, status: 401 };
    }
  }
  return { isAuthenticated: false, error: 'Authorization header missing or malformed.', status: 401 };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const publicApiRoutes = [
      '/api/auth/login', 
      // '/api/meta/assignees', // Consider if these truly need to be public without any auth
      // '/api/meta/environments',
      // '/api/meta/origins',
      // '/api/meta/priorities',
      // '/api/meta/situacoes',
      // '/api/meta/tipos',
      // '/api/ai/suggest-assignee' // Could also be protected
    ];

    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return new NextResponse(JSON.stringify({ message: authResult.error || 'Authentication required.' }), {
        status: authResult.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Token is valid, add user details from token to request headers
    // so downstream API routes can access them easily.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Id', authResult.user.userId);
    requestHeaders.set('X-User-Email', authResult.user.email);
    requestHeaders.set('X-User-Name', authResult.user.name);

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
