
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  userId: string;
  email: string;
  name: string;
}

async function authenticateAndEnrichRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove "Bearer "
    
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not configured on the server (middleware). Cannot verify tokens.');
      return { isAuthenticated: false, error: 'Server configuration error: JWT secret missing.', status: 500, headers: request.headers };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
      // Token is valid, add user details to request headers
      const enrichedHeaders = new Headers(request.headers);
      enrichedHeaders.set('X-User-Id', decoded.userId);
      enrichedHeaders.set('X-User-Email', decoded.email);
      enrichedHeaders.set('X-User-Name', decoded.name);
      return { isAuthenticated: true, user: decoded, headers: enrichedHeaders };
    } catch (err) {
      console.error('Token verification failed in middleware:', err); 
      let clientErrorMessage = 'Authentication failed: Invalid or expired token.'; 

      if (err instanceof jwt.TokenExpiredError) {
        clientErrorMessage = 'Authentication failed: Token has expired.';
      } else if (err instanceof jwt.JsonWebTokenError) {
        clientErrorMessage = `Authentication failed: Invalid token (${(err as jwt.JsonWebTokenError).message}).`;
        if ((err as jwt.JsonWebTokenError).message.includes('invalid signature')) {
            console.error("CRITICAL: JWT signature is invalid. This strongly suggests the JWT_SECRET in .env is mismatched or incorrect between token signing (login API) and verification (middleware). Please verify .env and restart the server.");
        } else if ((err as jwt.JsonWebTokenError).message.includes('jwt secret is required')) {
             console.error("CRITICAL: JWT_SECRET was present at the check but seems to be missing or invalid for jwt.verify. This is highly unusual. Check .env and server restart.");
        }
      }
      return { isAuthenticated: false, error: clientErrorMessage, status: 401, headers: request.headers };
    }
  }
  return { isAuthenticated: false, error: 'Authorization header missing or malformed.', status: 401, headers: request.headers };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public API routes that do not require authentication
  const publicApiRoutes = [
    '/api/auth/login', 
  ];

  if (pathname.startsWith('/api/')) {
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // All other API routes require authentication
    const authResult = await authenticateAndEnrichRequest(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return new NextResponse(JSON.stringify({ message: authResult.error || 'Authentication required.' }), {
        status: authResult.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Token is valid, proceed with the enriched headers
    return NextResponse.next({
        request: {
            headers: authResult.headers,
        }
    });
  }

  // For non-API routes, let Next.js handle them (client-side routing will manage redirects based on session)
  return NextResponse.next();
}

// Apply middleware to all API routes
export const config = {
  matcher: ['/api/:path*'], 
};
