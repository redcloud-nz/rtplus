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
const isSystemAdminRoute = createRouteMatcher(['/config(/.*)'])

export default clerkMiddleware(
    async (auth, req) => {
        const { userId, sessionClaims, redirectToSignIn } = await auth()

        if(userId) {
            // Authenticated user

            // Allow authenticated users to access onboarding routes
            if(isOnboardingRoute(req)) return NextResponse.next()

            // Redirect to onboarding if not completed
            if(sessionClaims?.rt_onboarding_status !== 'Complete') {
                const onBoardingUrl = new URL('/onboarding', req.url)
                logger.debug('Redirecting to onboarding', onBoardingUrl)
                return NextResponse.redirect(onBoardingUrl)
            }

            // Redirect non-system-admin users from system admin routes
            if(isSystemAdminRoute(req) && sessionClaims?.rt_system_role !== 'admin') {
                return NextResponse.redirect('/')
            }
            
            // Allow authenticated users to all routes
            return NextResponse.next()


        } else {
            // Unauthenticated user

            // Can access public routes
            if(isPublicRoute(req)) return NextResponse.next()

            // Otherwise, redirect to sign in
            else return redirectToSignIn({ returnBackUrl: req.url })
        }
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