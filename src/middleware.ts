/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextRequest, NextResponse, URLPattern } from 'next/server'

import { clerkMiddleware, ClerkMiddlewareAuth } from '@clerk/nextjs/server'

import { hasPermission } from './lib/permissions'
import { validateUUID } from './lib/id'



const patterns: { pattern: URLPattern, handler: (auth: ClerkMiddlewareAuth, req: NextRequest, match: NonNullable<ReturnType<typeof URLPattern.prototype.exec>>) => Promise<Response | void> }[] = [
    {
        pattern: new URLPattern({ pathname: '/(account|availability|checklists|competencies|manage|unified)(/.*)?' }),
        handler: async (auth) => {
            await auth.protect()
        }
    },
    {
        pattern: new URLPattern({ pathname: '/api/(personnel|skills|skill-check-sessions|skill-groups|skill-packages)(/.*)?' }),
        handler: async (auth) => {
            const { userId } = await auth()
            if(!userId) return new Response('Unauthorized', { status: 401 })
        }
    },
    {
        // This pattern protects the /api/teams/[teamId] route and subroutes to ensure that the user has the correct permissions to access the team
        pattern: new URLPattern({ pathname: '/api/teams/([^/]*)(/.*)?' }),
        handler: async (auth, req, match) => {
            const { userId, sessionClaims } = await auth()
            if(!userId) return new Response('Unauthorized', { status: 401 })
            
            const extractedTeamId = match.pathname.groups[0]

            if(extractedTeamId == undefined || !validateUUID(extractedTeamId)) {
                return new Response(`Invalid teamId: ${extractedTeamId}`, { status: 400 })
            }

            if(!hasPermission(sessionClaims, 'team:read', extractedTeamId)) {
                return new Response('Forbidden', { status: 403 })
            }
        }
    },
    {   
        // This pattern protects the /api/users/[personId] route and subroutes to ensure that the user can only access their own data
        pattern: new URLPattern({ pathname: '/api/users/([^/]*)(/.*)?' }),
        handler: async (auth, req, match) => {
            const { userId, sessionClaims } = await auth()
           
            if(!userId) return new Response('Unauthorized', { status: 401 })
            const userPersonId = sessionClaims!.rt_pid
            
            const extractedPersonId = match.pathname.groups[0]

            if(extractedPersonId == 'me') {
                const url = req.nextUrl.clone()
                url.pathname = `/api/users/${userPersonId}${match.pathname.groups[1] || ''}`
                return NextResponse.rewrite(url)
            }

            if(extractedPersonId == undefined || !validateUUID(extractedPersonId)) {
                return new Response(`Invalid personId: ${extractedPersonId}`, { status: 400 })
            }
            
            if(extractedPersonId !== userPersonId) {
                return new Response('Forbidden', { status: 403 })
            }
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