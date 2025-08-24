/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cache } from 'react'
import superjson from 'superjson'

import { auth, createClerkClient } from '@clerk/nextjs/server'
import { type Team as TeamRecord } from '@prisma/client'
import {  initTRPC, TRPCError } from '@trpc/server'

import prisma from '@/server/prisma'

interface Meta {
    authRequired?: boolean
    systemAdminRequired?: boolean
    teamAccessRequired?: boolean
    teamAdminRequired?: boolean
    activeTeamRequired?: boolean
}

interface RTPlusSession {
    userId: string
    personId: string
    activeTeam: {
        orgId: string,
        slug: string,
        role: 'org:admin' | 'org:member'
    } | null
}

type RTPlusSessionWithActiveTeam = RTPlusSession & {
    activeTeam: {
        orgId: string,
        slug: string,
        role: 'org:admin' | 'org:member'
    }
}

export const createTRPCContext = cache(async ({ headers }: { headers?: Headers  }) => {

    let fetchedAuth: Awaited<ReturnType<typeof auth>>
    try {
        fetchedAuth = await auth()
    } catch(ex) {
        console.error("Failed to fetch auth context", ex)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: "Failed to fetch auth context" })
    }

    return { 
        prisma,
        session: fetchedAuth.userId 
            ? { 
                userId: fetchedAuth.userId, 
                personId: fetchedAuth.sessionClaims.rt_person_id, 
                activeTeam: fetchedAuth.orgId 
                    ? {
                        orgId: fetchedAuth.orgId!,
                        slug: fetchedAuth.orgSlug!,
                        role: fetchedAuth.orgRole as 'org:admin' | 'org:member',
                    } 
                    : null
            } satisfies RTPlusSession 
            : null,
        headers,
        get clerkClient() { return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY}) }
    }
})

type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Avoid exporting the entire t-object
const t = initTRPC.context<Context>().meta<Meta>().create({
    transformer: superjson,
    errorFormatter(opts) {
        const { shape, error } = opts
        return {
            ...shape,
            cause: error.cause,
        }
    }
})


// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactor = t.createCallerFactory

export type PublicContext = Context

export const publicProcedure = t.procedure

export type AuthenticatedContext = Context & { 
    session: RTPlusSession,
    isSystemAdmin: boolean,
    isCurrentTeamAdmin: boolean,
    hasTeamAccess(teamRecord: TeamRecord): boolean,
    hasTeamAdmin(teamRecord: TeamRecord): boolean,
    requireSystemAdmin(): boolean,
    requireTeamAdmin(orgId: string): boolean,
}

function createAuthenticatedContext(ctx: Context): AuthenticatedContext {

    if (ctx.session == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No person ID in session claims" })

    const isSystemAdmin = ctx.session.activeTeam?.slug == 'system' && ctx.session.activeTeam?.role === 'org:admin'

    return {
        ...ctx,
        session: ctx.session!,
        isSystemAdmin,
        isCurrentTeamAdmin: ctx.session.activeTeam?.role === 'org:admin',
         hasTeamAccess(team: TeamRecord) {
            return isSystemAdmin || ctx.session?.activeTeam?.orgId === team.clerkOrgId
        },
        hasTeamAdmin(team: TeamRecord) {
            return isSystemAdmin || (ctx.session?.activeTeam?.orgId === team.clerkOrgId && ctx.session?.activeTeam?.role === 'org:admin')
        },
        requireSystemAdmin() {
            if (isSystemAdmin) return true
            throw new TRPCError({ code: 'FORBIDDEN', message: "Not a system admin" })
        },
       
        requireTeamAdmin(orgId: string) {
            if ((ctx.session?.activeTeam?.orgId === orgId && ctx.session?.activeTeam?.role === 'org:admin')) return true
            throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team or system admin" })
        },
    }
}

export const authenticatedProcedure = t.procedure.meta({ authRequired: true }).use((opts) => {
    const { session } = opts.ctx

    if(session == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })

    return opts.next({
        ctx: createAuthenticatedContext(opts.ctx)
    })
})

export type AuthenticatedTeamContext = AuthenticatedContext & { session: RTPlusSessionWithActiveTeam }

export const teamProcedure = t.procedure.meta({ authRequired: true, activeTeamRequired: true }).use((opts) => {
    const { session } = opts.ctx

    if(session == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })
    if(session.activeTeam == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })

    return opts.next({
        ctx: {
            ...createAuthenticatedContext(opts.ctx),
            session: { ...session, activeTeam: session.activeTeam! } satisfies RTPlusSessionWithActiveTeam,
        } satisfies AuthenticatedTeamContext,
    })
})

export const teamAdminProcedure = t.procedure.meta({ authRequired: true, activeTeamRequired: true, teamAdminRequired: true }).use((opts) => {
    const { session } = opts.ctx

    if(session == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })
    if(session.activeTeam == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })
    if(session.activeTeam.role !== 'org:admin') throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team admin" })

    return opts.next({
        ctx: {
            ...createAuthenticatedContext(opts.ctx),
            session: { ...session, activeTeam: session.activeTeam! } satisfies RTPlusSessionWithActiveTeam,
        } satisfies AuthenticatedTeamContext,
    })
})


export const systemAdminProcedure = t.procedure.meta({ authRequired: true, systemAdminRequired: true }).use((opts) => {
    const { session } = opts.ctx

    if(session == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })
    if(session.activeTeam == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })
    if(session.activeTeam.slug != 'system') throw new TRPCError({ code: 'FORBIDDEN', message: "Not a system admin." })

    return opts.next({
        ctx: {
            ...createAuthenticatedContext(opts.ctx),
            session: { ...session, activeTeam: session.activeTeam! } satisfies RTPlusSessionWithActiveTeam,
        }
    })
})