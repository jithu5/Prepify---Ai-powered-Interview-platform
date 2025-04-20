import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from 'next-auth/jwt'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token = await getToken({ req: request })

    console.log('token', token)

    const url = request.nextUrl;

    console.log('url', url)

    // If the user is authenticated, redirect to the home page
    if (token && (url.pathname === '/register' || url.pathname === '/login')) {
        // Redirect to the home page
        return NextResponse.redirect(new URL('/home', request.url))
    }
    
    // If the user is not authenticated, redirect to the login page
    if (!token && (url.pathname !== '/home' && url.pathname !== '/register' && url.pathname !== '/login')) {
        // Redirect to the login page
        return NextResponse.redirect(new URL('/login', request.url))
    }
    
    return NextResponse.redirect(new URL('/home', request.url))
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/', '/register', '/login', '/home/:path*', '/profile/:path*']
}