/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cache } from 'react'
import superjson from 'superjson'
import z from 'zod'

import { auth, createClerkClient } from '@clerk/nextjs/server'
import { type Team as TeamRecord } from '@prisma/client'
import {  initTRPC, TRPCError } from '@trpc/server'

import { zodNanoId8 } from '@/lib/validation'
import { fetchTeamByIdCached } from '@/server/data/team'
import prisma from '@/server/prisma'

import { Messages } from './messages'


interface Meta {
    authRequired?: boolean
    systemAdminRequired?: boolean
    teamAccessRequired?: boolean
    teamAdminRequired?: boolean
    activeTeamRequired?: boolean
}

interface RTPlusAuth {
    userId: string
    personId: string
    activeTeam: {
        orgId: string,
        slug: string,
        role: 'org:admin' | 'org:member'
    } | null
}

type RTPlusAuthWithActiveTeam = RTPlusAuth & {
    activeTeam: {
        orgId: string,
        slug: string,
        role: 'org:admin' | 'org:member'
    }
}

interface CreateInnerTRPCContextOptions {
    auth: RTPlusAuth | null
    headers?: Headers
    getClerkClient: () => ReturnType<typeof createClerkClient>
    getTeamById: (teamId: string) => Promise<TeamRecord | null>
}

/**
 * Creates the inner TRPC context.
 * Useful for testing and tRPC calls that don't have to go through the full auth flow.
 */
export function createInnerTRPCContext({ auth, headers, getClerkClient, getTeamById }: CreateInnerTRPCContextOptions) {
    return { 
        prisma,
        auth,
        headers,
        getClerkClient,
        getTeamById
    }
}

/**
 * Creates the TRPC context for each request.
 * Fetches the auth state from Clerk and adds it to the context.
 */
export const createTRPCContext = cache(async ({ headers }: { headers?: Headers  }) => {

    let clerkAuth: Awaited<ReturnType<typeof auth>>
    try {
        clerkAuth = await auth()
    } catch(ex) {
        console.error("Failed to fetch auth context", ex)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: "Failed to fetch auth context" })
    }

    return createInnerTRPCContext({ 
        auth: clerkAuth.userId 
            ? { 
                userId: clerkAuth.userId, 
                personId: clerkAuth.sessionClaims.rt_person_id, 
                activeTeam: clerkAuth.orgId 
                    ? {
                        orgId: clerkAuth.orgId!,
                        slug: clerkAuth.orgSlug!,
                        role: clerkAuth.orgRole as 'org:admin' | 'org:member',
                    } 
                    : null
            } satisfies RTPlusAuth 
            : null,
        headers,
        getClerkClient() { return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY}) },
        getTeamById: fetchTeamByIdCached,
    })
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
    auth: RTPlusAuth,
    isSystemAdmin: boolean,
    isCurrentTeamAdmin: boolean,
    hasTeamAccess(teamRecord: TeamRecord): boolean,
    hasTeamAdmin(teamRecord: TeamRecord): boolean,
    requireSystemAdmin(): boolean,
    requireTeamAdmin(orgId: string): boolean,
}

function createAuthenticatedContext(ctx: Context): AuthenticatedContext {

    if (ctx.auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "User is not authenticated." })

    const isSystemAdmin = ctx.auth.activeTeam?.slug == 'system' && ctx.auth.activeTeam?.role === 'org:admin'

    return {
        ...ctx,
        auth: ctx.auth!,
        isSystemAdmin,
        isCurrentTeamAdmin: ctx.auth.activeTeam?.role === 'org:admin',
        hasTeamAccess(team: TeamRecord) {
            return isSystemAdmin || ctx.auth?.activeTeam?.orgId === team.clerkOrgId
        },
        hasTeamAdmin(team: TeamRecord) {
            return isSystemAdmin || (ctx.auth?.activeTeam?.orgId === team.clerkOrgId && ctx.auth?.activeTeam?.role === 'org:admin')
        },
        requireSystemAdmin() {
            if (isSystemAdmin) return true
            throw new TRPCError({ code: 'FORBIDDEN', message: "Not a system admin" })
        },
       
        requireTeamAdmin(orgId: string) {
            if ((ctx.auth?.activeTeam?.orgId === orgId && ctx.auth?.activeTeam?.role === 'org:admin')) return true
            throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team or system admin" })
        },
    }
}

/**
 * Procedure that requires the user to be authenticated.
 * @throws TRPCError(UNAUTHORIZED) if there is no active session.
 */
export const authenticatedProcedure = t.procedure.meta({ authRequired: true }).use((opts) => {
    const { auth } = opts.ctx

    if(auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })

    return opts.next({
        ctx: createAuthenticatedContext(opts.ctx)
    })
})

export type AuthenticatedTeamContext = AuthenticatedContext & { auth: RTPlusAuthWithActiveTeam, team: TeamRecord }

/**
 * Procedure that requires the user to have access to the specified team and the team to be active.
 * @param teamId The ID of the team to check access for.
 * @throws TRPCError(UNAUTHORIZED) if there is no active team.
 * @throws TRPCError(FORBIDDEN) if the user does not have access to the team or the team is not active.
 */
export const teamProcedure = t.procedure
    .meta({ authRequired: true, activeTeamRequired: true })
    .input(z.object({ teamId: zodNanoId8 }))
    .use(async (opts) => {
        const { auth } = opts.ctx

        if(auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })
        if(auth.activeTeam == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })

        const authenticatedContext = createAuthenticatedContext(opts.ctx)

        const team = await opts.ctx.getTeamById(opts.input.teamId)
        if(!team || !authenticatedContext.hasTeamAccess(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(opts.input.teamId) })

        return opts.next({
            ctx: {
                ...authenticatedContext,
                auth: { ...auth, activeTeam: auth.activeTeam! } satisfies RTPlusAuthWithActiveTeam,
                team,
            } satisfies AuthenticatedTeamContext,
        })
    })

/**
 * Procedure that requires the user to be an admin of the active team.
 * @param teamId The ID of the team to check admin access for.
 * @throws TRPCError(UNAUTHORIZED) if there is no active team.
 * @throws TRPCError(FORBIDDEN) if the user is not an admin of the team.
 */
export const teamAdminProcedure = t.procedure
    .meta({ authRequired: true, activeTeamRequired: true, teamAdminRequired: true })
    .input(z.object({ teamId: zodNanoId8 }))
    .use(async (opts) => {
        const { auth } = opts.ctx

        if(auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })
        if(auth.activeTeam == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })
        if(auth.activeTeam.role !== 'org:admin') throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team admin" })

        const authenticatedContext = createAuthenticatedContext(opts.ctx)

        const team = await opts.ctx.getTeamById(opts.input.teamId)
        if(!team || !authenticatedContext.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(opts.input.teamId) })

        return opts.next({
            ctx: {
                ...authenticatedContext,
                auth: { ...auth, activeTeam: auth.activeTeam! } satisfies RTPlusAuthWithActiveTeam,
                team,
            } satisfies AuthenticatedTeamContext,
        })
    })


export const systemAdminProcedure = t.procedure.meta({ authRequired: true, systemAdminRequired: true }).use((opts) => {
    const { auth } = opts.ctx

    if(auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })
    if(auth.activeTeam == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })
    if(auth.activeTeam.slug != 'system') throw new TRPCError({ code: 'FORBIDDEN', message: "Not a system admin." })

    return opts.next({
        ctx: {
            ...createAuthenticatedContext(opts.ctx),
            auth: { ...auth, activeTeam: auth.activeTeam! } satisfies RTPlusAuthWithActiveTeam,
        }
    })
})