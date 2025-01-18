/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextRequest, URLPattern } from 'next/server'

import { clerkMiddleware, ClerkMiddlewareAuth } from '@clerk/nextjs/server'

const patterns: { pattern: URLPattern, handler: (auth: ClerkMiddlewareAuth, req: NextRequest, match: NonNullable<ReturnType<typeof URLPattern.prototype.exec>>) => Promise<Response | void> }[] = [
    {
        pattern: new URLPattern({ pathname: '/(account|availability/checklists/competencies/manage/unified)/(.*)' }),
        handler: async (auth) => {
            await auth.protect()
        }
    }
]

export default clerkMiddleware(async (auth, req) => {

    for(const pattern of patterns) {
        const match = pattern.pattern.exec(req.nextUrl)
        if(match != null) {
            const result = await pattern.handler(auth, req, match)
            if(result != undefined) {
                return result
            }
        }
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ]
}