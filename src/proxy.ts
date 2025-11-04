/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextResponse } from 'next/server'

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'


const isPublicRoute = createRouteMatcher(['/', '/about', '/api/webhooks(.*)','/contact', '/privacy-policy', '/sign-in', '/sign-up', '/terms-of-service'])

export default clerkMiddleware(
    async (auth, req) => {
        if(isPublicRoute(req)) return NextResponse.next()
        
        const { userId, redirectToSignIn } = await auth()

        if(userId) {
            // Authenticated user

            // if(sessionClaims.rt_onboarding_status != 'complete' && !req.nextUrl.pathname.startsWith('/onboarding')) {
            //     // Redirect users with incomplete onboarding
            //     const url = req.nextUrl.clone()
            //     url.pathname = '/onboarding'
            //     url.searchParams.set('redirect_url', req.url)
            //     return NextResponse.redirect(url)
            // }
            
            // Allow access
            return NextResponse.next()


        } else {
            // Unauthenticated user

            // Otherwise, redirect to sign in
            return redirectToSignIn({ returnBackUrl: req.url })
        }
    },
    { 
        organizationSyncOptions: {
            organizationPatterns: [
                '/orgs/:slug',
                '/orgs/:slug/(.*)',
            ],
            personalAccountPatterns: [
                '/personal',
                '/personal/(.*)',
            ]
        }
    }
)

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}