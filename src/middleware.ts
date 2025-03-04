/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextResponse } from 'next/server'

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

import {RTPlusLogger} from '@/lib/logger'

const logger = new RTPlusLogger('middleware')

const isOnboardingRoute = createRouteMatcher(['/onboarding', '/policies(/.*)', '/trpc/(.*)'])
const isPublicRoute = createRouteMatcher(['/about', '/cards(/.*)', '/policies(/.*)', '/teams/([^/]*)', '/trpc/(.*)'])

export default clerkMiddleware(
    async (auth, req) => {
        const { userId, sessionClaims, redirectToSignIn } = await auth()

        // Allow authenticated users to access onboarding routes
        if(userId && isOnboardingRoute(req)) return NextResponse.next()

        // Redirect to sign in if not authenticated
        if(!userId && !isPublicRoute(req)) {
            logger.debug('Redirecting to sign in with return URL', req.url)
            return redirectToSignIn({ returnBackUrl: req.url })
        }

        // Redirect to onboarding if not completed
        if(userId && sessionClaims?.rt_uos !== 'Complete') {
            const onBoardingUrl = new URL('/onboarding', req.url)
            logger.debug('Redirecting to onboarding', onBoardingUrl)
            return NextResponse.redirect(onBoardingUrl)
        }

        // Allow authenticated users to access non-public routes
        if(userId && !isPublicRoute(req)) return NextResponse.next()
    },
    {
        organizationSyncOptions: {
            organizationPatterns: [
                '/teams/:slug/(.*)'
            ],
            personalAccountPatterns: [
                '/personal',
                '/personal/(.*)'
            ]
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