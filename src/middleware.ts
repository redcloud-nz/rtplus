/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextResponse } from 'next/server'

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

import {RTPlusLogger} from '@/lib/logger'

const logger = new RTPlusLogger('middleware')

const isPrivateRoute = createRouteMatcher(['/app(/.*)'])
const isSystemAdminRoute = createRouteMatcher(['/app/system(/.*)'])

export default clerkMiddleware(
    async (auth, req) => {
        const { userId, sessionClaims, redirectToSignIn } = await auth()

        if(userId) {
            // Authenticated user

            // Redirect non-system-admin users from system admin routes
            if(isSystemAdminRoute(req) && sessionClaims?.rt_system_role !== 'admin') {
                return NextResponse.redirect('/')
            }
            
            // Allow authenticated users to all non-system routes
            return NextResponse.next()


        } else {
            // Unauthenticated user

            // If request is for a private route, redirect to sign in
            if(isPrivateRoute(req)) redirectToSignIn({ returnBackUrl: req.url }) 

            // Otherwise, allow access
            else return NextResponse.next()
        }
    },
    {
        organizationSyncOptions: {
            organizationPatterns: [
                '/app/teams/:slug',
                '/app/teams/:slug/(.*)'
            ],
            personalAccountPatterns: [
                '/app/personal',
                'app/personal/(.*)'
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