/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cache } from 'react'
import superjson from 'superjson'

import { auth, createClerkClient } from '@clerk/nextjs/server'
import {  initTRPC, TRPCError } from '@trpc/server'

import prisma from '@/server/prisma'

interface Meta {
    authRequired?: boolean
    systemAdminRequired?: boolean
    teamAccessRequired?: boolean
    teamAdminRequired?: boolean
    activeTeamRequired?: boolean
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
        auth: fetchedAuth,
        headers,
        get clerkClient() { return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY}) },
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
    personId: string,
    isSystemAdmin: boolean,
    isCurrentTeamAdmin: boolean,
    isTeamAdmin(orgId: string): boolean,
    requireSystemAdmin(): boolean,
    requireTeamAccess(orgId: string): boolean,
    requireTeamAdmin(orgId: string): boolean,
}

function createAuthenticatedContext(ctx: Context): AuthenticatedContext {

    const sessionClaims = ctx.auth.sessionClaims
    if (sessionClaims == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No person ID in session claims" })

    const isSystemAdmin = ctx.auth.orgSlug == 'system' && ctx.auth.orgRole === 'org:admin'

    return {
        ...ctx,
        personId: sessionClaims.rt_person_id,
        isSystemAdmin,
        isCurrentTeamAdmin: ctx.auth.orgRole === 'org:admin',
        isTeamAdmin(orgId: string) {
            return ctx.auth.orgId === orgId && ctx.auth.orgRole === 'org:admin'
        },
        requireSystemAdmin() {
            if (isSystemAdmin) return true
            throw new TRPCError({ code: 'FORBIDDEN', message: "Not a system admin" })
        },
        requireTeamAccess(orgId: string) {
            if (ctx.auth.orgId === orgId) return true
            throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team member" })
        },
        requireTeamAdmin(orgId: string) {
            if ((ctx.auth.orgId === orgId && ctx.auth.orgRole === 'org:admin')) return true
            throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team or system admin" })
        },
    }
}

export const authenticatedProcedure = t.procedure.meta({ authRequired: true }).use((opts) => {
    const auth = opts.ctx.auth

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })

    return opts.next({
        ctx: createAuthenticatedContext(opts.ctx)
    })
})

export type AuthenticatedTeamContext = AuthenticatedContext & { teamSlug: string, orgId: string }

export const teamProcedure = t.procedure.meta({ authRequired: true, activeTeamRequired: true }).use((opts) => {
    const auth = opts.ctx.auth

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })
    if(auth.orgId == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })

    return opts.next({
        ctx: {
            ...createAuthenticatedContext(opts.ctx),
            teamSlug: auth.orgSlug!,
            orgId: auth.orgId,
        } satisfies AuthenticatedTeamContext,
    })
})

export const teamAdminProcedure = t.procedure.meta({ authRequired: true, activeTeamRequired: true, teamAdminRequired: true }).use((opts) => {
    const auth = opts.ctx.auth

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })
    if(auth.orgId == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })
    if(auth.orgRole !== 'org:admin') throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team admin" })

    return opts.next({
        ctx: {
            ...createAuthenticatedContext(opts.ctx),
            teamSlug: auth.orgSlug!,
            orgId: auth.orgId,
        } satisfies AuthenticatedTeamContext,
    })
})


export const systemAdminProcedure = t.procedure.meta({ authRequired: true, systemAdminRequired: true }).use((opts) => {
     const auth = opts.ctx.auth

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })
    if(auth.sessionClaims.org_slug != 'system') throw new TRPCError({ code: 'FORBIDDEN', message: "Not a system admin" })

    return opts.next({
        ctx: createAuthenticatedContext(opts.ctx)
    })
})