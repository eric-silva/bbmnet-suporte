
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

interface DecodedToken {
  userId: string;
  email: string;
  name: string;
  fotoUrl?: string | null;
  [key: string]: any;
}

async function authenticateAndEnrichRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not configured on the server (middleware). Cannot verify tokens.');
      return { isAuthenticated: false, error: 'Server configuration error: JWT secret missing.', status: 500, headers: request.headers };
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret) as { payload: DecodedToken };


      if (
        !payload ||
        typeof payload !== 'object' ||
        !payload.userId ||
        !payload.email ||
        !payload.name
      ) {
        console.error('Middleware: Invalid token payload structure:', payload);
        throw new Error('Invalid token payload: missing required fields');
      }

      const enrichedHeaders = new Headers(request.headers);
      enrichedHeaders.set('X-User-Id', String(payload.userId));
      enrichedHeaders.set('X-User-Email', String(payload.email));
      enrichedHeaders.set('X-User-Name', String(payload.name));
      if (payload.fotoUrl) {
        enrichedHeaders.set('X-User-FotoUrl', payload.fotoUrl);
      }
      return { isAuthenticated: true, user: payload, headers: enrichedHeaders };
    } catch (err: any) {
      let clientErrorMessage = 'Authentication failed: Invalid or expired token.';
      if (err.code === 'ERR_JWT_EXPIRED') {
        clientErrorMessage = 'Authentication failed: Token has expired.';
        console.warn('Middleware: Token verification failed - Token expired.');
      } else if (err.name === 'JsonWebTokenError' || err.code === 'ERR_JWS_INVALID' || err.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
        clientErrorMessage = 'Authentication failed: Token signature is invalid.';
        console.error('CRITICAL: JWT signature is invalid. Check JWT_SECRET consistency and value. Error:', err.message);
      } else {
        console.error('Middleware: Token verification failed with an unexpected error:', err.message, err.code, err.name);
      }
      return { isAuthenticated: false, error: clientErrorMessage, status: 401, headers: request.headers };
    }
  }
  return { isAuthenticated: false, error: 'Authorization header missing or malformed.', status: 401, headers: request.headers };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicApiRoutes = [
    '/api/auth/login',
  ];

  if (pathname.startsWith('/api/')) {
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const authResult = await authenticateAndEnrichRequest(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return new NextResponse(JSON.stringify({ message: authResult.error || 'Authentication required.' }), {
        status: authResult.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return NextResponse.next({
        request: {
            headers: authResult.headers,
        }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
