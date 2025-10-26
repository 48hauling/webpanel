import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get JWT token from cookies or Authorization header
  const token = request.cookies.get('devapi_token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')

  const isLoginPage = request.nextUrl.pathname === '/login'

  // If no token and not on login page, redirect to login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If has token and on login page, redirect to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Optionally verify token with DevApi here
  // For now, we trust the token if it exists
  // The token will be validated on API calls

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (logo file)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (other static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\.svg|.*\.png|.*\.jpg|.*\.jpeg|.*\.gif|.*\.webp).*)',
  ],
}
