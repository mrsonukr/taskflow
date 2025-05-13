import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Get the token from the request
  const token = request.cookies.get('taskflow_token')?.value
  const isAuthPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register'
  
  // If trying to access auth pages while logged in, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If trying to access protected pages without token, redirect to login
  if (!isAuthPage && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/', '/register', '/dashboard/:path*']
}