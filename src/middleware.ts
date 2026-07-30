import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Extract token from cookies
  const token = req.cookies.get('gigtrust-auth-token')?.value;
  let session: { userId: string; email: string; role: string; exp?: number } | null = null;

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        // Edge-compatible Base64URL decoder using standard Web APIs
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        
        // Verify expiration (JWT exp is in seconds)
        if (parsed.exp && parsed.exp * 1000 > Date.now()) {
          session = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to decode token in Edge middleware:", e);
    }
  }

  // Define route classifications
  const isWorkerRoute = pathname.startsWith('/worker');
  const isEmployerRoute = pathname.startsWith('/employer');
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // 1. Not logged in
  if (!session) {
    // Redirect protected routes to login
    if (isWorkerRoute || isEmployerRoute || isAdminRoute) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Logged in - check role access
  if (isAuthRoute) {
    // Redirect logged-in users away from login/signup to their dashboard
    return redirectToDashboard(session.role, req);
  }

  if (isWorkerRoute && session.role !== 'worker' && session.role !== 'admin') {
    // Worker routes are for workers (or admins)
    return redirectToDashboard(session.role, req);
  }

  if (isEmployerRoute && session.role !== 'employer' && session.role !== 'admin') {
    // Employer routes are for employers (or admins)
    return redirectToDashboard(session.role, req);
  }

  if (isAdminRoute && session.role !== 'admin') {
    // Admin routes are strictly for admin
    return redirectToDashboard(session.role, req);
  }

  return NextResponse.next();
}

function redirectToDashboard(role: string, req: NextRequest) {
  if (role === 'worker') {
    return NextResponse.redirect(new URL('/worker/dashboard', req.url));
  } else if (role === 'employer') {
    return NextResponse.redirect(new URL('/employer/dashboard', req.url));
  } else if (role === 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
  return NextResponse.redirect(new URL('/', req.url));
}

// Config to specify matching paths
export const config = {
  matcher: [
    '/worker/:path*',
    '/employer/:path*',
    '/admin/:path*',
    '/login',
    '/signup'
  ]
};
