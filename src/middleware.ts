/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextRequest, NextResponse, URLPattern } from 'next/server'

import { clerkMiddleware, ClerkMiddlewareAuth } from '@clerk/nextjs/server'

const patterns: { pattern: URLPattern, handler: (auth: ClerkMiddlewareAuth, req: NextRequest, match: NonNullable<ReturnType<typeof URLPattern.prototype.exec>>) => Promise<Response | void> }[] = [
    {
        pattern: new URLPattern({ pathname: '/(account|api|availability/checklists/competencies/unified)/(.*)' }),
        handler: async (auth) => {
            await auth.protect()
        }
    },
    {
        pattern: new URLPattern({ pathname: '/(manage)/(.*)' }),
        handler: async (auth) => {
            await auth.protect({ role: 'org:admin' })
        }
    }
]

export default clerkMiddleware(async (auth, req) => {

    for(const pattern of patterns) {
        const match = pattern.pattern.exec(req.nextUrl)
        if(match != null) {
            console.log(`[middleware] Pattern Matched \n    Pattern: ${pattern.pattern.pathname} \n        URL: ${req.nextUrl.pathname}`)
            const result = await pattern.handler(auth, req, match)
            if(result != undefined) {
                console.log('[middleware] Response', result.status)
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