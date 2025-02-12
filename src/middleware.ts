/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'


const isProtectedRoute = createRouteMatcher(['/system/(.*)', '/teams/(.*)/(.*)'])

export default clerkMiddleware(
    async (auth, req) => {
        if(isProtectedRoute(req)) await auth.protect()
    },
    {
        organizationSyncOptions: {
            organizationPatterns: [
                '/teams/:slug/(.*)'
            ],
            personalAccountPatterns: [
                '/me',
                '/me/(.*)'
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