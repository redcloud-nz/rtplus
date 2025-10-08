/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cache } from 'react'
import superjson from 'superjson'
import z from 'zod'

import { auth, createClerkClient } from '@clerk/nextjs/server'

import { PersonId } from '@/lib/schemas/person'
import { orgIdSchema, userIdSchema } from '@/lib/validation'

import {  initTRPC, TRPCError } from '@trpc/server'
import prisma from '@/server/prisma'


const DEVELOPMENT_DELAY = { min: 250, max: 1000 } // ms

interface Meta {
    authRequired?: boolean
    systemAdminRequired?: boolean
    teamAccessRequired?: boolean
    teamAdminRequired?: boolean
    activeTeamRequired?: boolean
}

interface RTPlusAuth {
    userId: string & z.BRAND<'ClerkUserId'>
    personId: PersonId | null
    activeOrg: {
        orgId: string & z.BRAND<'ClerkOrgId'>,
        role: 'org:admin' | 'org:member'
    } | null
}

type RTPlusAuthWithActiveOrganization = RTPlusAuth & {
    activeOrg: {
        orgId: string,
        role: 'org:admin' | 'org:member'
    }
}

interface CreateInnerTRPCContextOptions {
    auth: RTPlusAuth | null
    getClerkClient: () => ReturnType<typeof createClerkClient>
}

/**
 * Creates the inner TRPC context.
 * Useful for testing and tRPC calls that don't have to go through the full auth flow.
 */
export function createInnerTRPCContext({ auth, getClerkClient }: CreateInnerTRPCContextOptions) {
    return { 
        prisma,
        auth,
        getClerkClient,
    }
}

/**
 * Creates the TRPC context for each request.
 * Fetches the auth state from Clerk and adds it to the context.
 */
export const createTRPCContext = cache(async () => {

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
                userId: userIdSchema.parse(clerkAuth.userId),
                personId: clerkAuth.sessionClaims?.rt_person_id ? PersonId.schema.parse(clerkAuth.sessionClaims?.rt_person_id) : null,
                activeOrg: clerkAuth.orgId 
                    ? {
                        orgId: orgIdSchema.parse(clerkAuth.orgId!),
                        role: clerkAuth.orgRole as 'org:admin' | 'org:member',
                    } 
                    : null
            } satisfies RTPlusAuth 
            : null,
        getClerkClient() { return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY}) },
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

export const publicProcedure = t.procedure.use(
    async function artificialDelayInDevelopment(opts) {
        const res = opts.next(opts)

        if(process.env.NODE_ENV === 'development') {
            const delay = Math.floor(Math.random() * (DEVELOPMENT_DELAY.max - DEVELOPMENT_DELAY.min + 1)) + DEVELOPMENT_DELAY.min

            console.debug(`ℹ️  doing artificial delay of ${delay}ms before returning result for ${opts.path}`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }

        return res
    }
)

export type AuthenticatedContext = Context & { 
    auth: RTPlusAuth,
    isCurrentTeamAdmin: boolean,
    requireTeamAdmin(orgId: string): boolean,
}

function createAuthenticatedContext(ctx: Context): AuthenticatedContext {

    if (ctx.auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "User is not authenticated." })

    return {
        ...ctx,
        auth: ctx.auth!,
        isCurrentTeamAdmin: ctx.auth.activeOrg?.role === 'org:admin',
       
        requireTeamAdmin(orgId: string) {
            if ((ctx.auth?.activeOrg?.orgId === orgId && ctx.auth?.activeOrg?.role === 'org:admin')) return true
            throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team or system admin" })
        },
    }
}

/**
 * Procedure that requires the user to be authenticated.
 * @throws TRPCError(UNAUTHORIZED) if there is no active session.
 */
export const authenticatedProcedure = publicProcedure.meta({ authRequired: true }).use((opts) => {
    const { auth } = opts.ctx

    if(auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })

    return opts.next({
        ctx: createAuthenticatedContext(opts.ctx)
    })
})

export type AuthenticatedOrgContext = AuthenticatedContext & { auth: RTPlusAuthWithActiveOrganization }

/**
 * Procedure that requires the user to have an active organization.
 * @throws TRPCError(UNAUTHORIZED) if there is no active team.
 * @throws TRPCError(FORBIDDEN) if the user does not have access to the team or the team is not active.
 */
export const orgProcedure = publicProcedure
    .meta({ authRequired: true, activeTeamRequired: true })
    .use(async (opts) => {
        const { auth } = opts.ctx

        if(auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })
        if(auth.activeOrg == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active organization." })

        const authenticatedContext = createAuthenticatedContext(opts.ctx)

        return opts.next({
            ctx: {
                ...authenticatedContext,
                auth: { ...auth, activeOrg: auth.activeOrg! } satisfies RTPlusAuthWithActiveOrganization,
            } satisfies AuthenticatedOrgContext,
        })
    })

/**
 * Procedure that requires the user to be an admin of the active organization.
 * @throws TRPCError(UNAUTHORIZED) if there is no active team.
 * @throws TRPCError(FORBIDDEN) if the user is not an admin of the team.
 */
export const orgAdminProcedure = publicProcedure
    .meta({ authRequired: true, activeTeamRequired: true, teamAdminRequired: true })
    .use(async (opts) => {
        const { auth } = opts.ctx

        if(auth == null) throw new TRPCError({ code: 'UNAUTHORIZED', message: "No active session." })
        if(auth.activeOrg == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active organization." })
        if(auth.activeOrg.role !== 'org:admin') throw new TRPCError({ code: 'FORBIDDEN', message: "Not an organization admin" })

        const authenticatedContext = createAuthenticatedContext(opts.ctx)

        return opts.next({
            ctx: {
                ...authenticatedContext,
                auth: { ...auth, activeOrg: auth.activeOrg! } satisfies RTPlusAuthWithActiveOrganization,
            } satisfies AuthenticatedOrgContext,
        })
    })