/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextResponse } from 'next/server'

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'


const isPublicRoute = createRouteMatcher(['/', '/about', '/contact', '/privacy-policy', '/terms-of-service', '/api/webhooks(.*)'])
const isSystemRoute = createRouteMatcher(['/system(/.*)'])

export default clerkMiddleware(
    async (auth, req) => {
        if(isPublicRoute(req)) return NextResponse.next()
        
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

            // Otherwise, redirect to sign in
            return redirectToSignIn({ returnBackUrl: req.url })
        }
    }
)

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}