import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token
    const path = request.nextUrl.pathname

    // Admin routes protection
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Tenant routes protection
    if (path.startsWith('/tenant') && token?.role !== 'tenant' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes that don't require auth
        const publicRoutes = ['/auth/signin', '/auth/signup', '/setup', '/', '/unauthorized']
        if (publicRoutes.some((route) => path.startsWith(route))) {
          return true
        }

        // API routes that don't require auth
        if (path.startsWith('/api/auth')) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*|placeholder.*).*)',
  ],
}
