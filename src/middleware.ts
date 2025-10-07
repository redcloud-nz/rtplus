/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextResponse } from 'next/server'

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/', '/about', '/contact', '/privacy-policy', '/terms-of-service'])
const isSystemRoute = createRouteMatcher(['/system(/.*)'])

export default clerkMiddleware(
    async (auth, req) => {
        const { userId, sessionClaims, redirectToSignIn } = await auth()

        if(userId) {
            // Authenticated user

            if(sessionClaims.rt_onboarding_status != 'complete' && !req.nextUrl.pathname.startsWith('/onboarding')) {
                // Redirect users with incomplete onboarding
                const url = req.nextUrl.clone()
                url.pathname = '/onboarding'
                url.searchParams.set('redirect_url', req.url)
                return NextResponse.redirect(url)
            }

            // Redirect non system users from system routes
            if(isSystemRoute(req) && sessionClaims?.org_slug != 'system') {
                const url = req.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.rewrite(url)
            }
            
            // Allow access
            return NextResponse.next()


        } else {
            // Unauthenticated user

            // If request is for a public route, allow access
            if(isPublicRoute(req)) return NextResponse.next()

            // Otherwise, redirect to sign in
            else return redirectToSignIn({ returnBackUrl: req.url })
        }
    }
)

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ]
}