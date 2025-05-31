/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cache } from 'react'
import superjson from 'superjson'

import { auth } from '@clerk/nextjs/server'
import {  initTRPC, TRPCError } from '@trpc/server'

import prisma from '@/server/prisma'



export const createTRPCContext = cache(async () => {
    return { 
        prisma,
        auth: await auth(),
    }
})

type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Avoid exporting the entire t-object
const t = initTRPC.context<Context>().create({
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

export type AuthenticatedContext = Context & { personId: string }

export const authenticatedProcedure = t.procedure.use((opts) => {
    const { auth, ...ctx } = opts.ctx

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })

    return opts.next({
        ctx: {
            ...ctx,
            auth,
            personId: auth.sessionClaims.rt_person_id,
        } satisfies AuthenticatedContext,
    })
})

export type AuthenticatedTeamContext = AuthenticatedContext & { teamSlug: string }

export const teamProcedure = t.procedure.use((opts) => {
    const { auth, ...ctx } = opts.ctx

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })
    if(auth.orgId == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })

    return opts.next({
        ctx: {
            ...ctx,
            auth,
            personId: auth.sessionClaims.rt_person_id,
            teamSlug: auth.orgSlug!,
        } satisfies AuthenticatedTeamContext,
    })
})

export const teamAdminProcedure = t.procedure.use((opts) => {
    const { auth, ...ctx } = opts.ctx

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })
    if(auth.orgId == null) throw new TRPCError({ code: 'FORBIDDEN', message: "No active team." })
    if(auth.orgRole !== 'org:admin') throw new TRPCError({ code: 'FORBIDDEN', message: "Not a team admin" })

    return opts.next({
        ctx: {
            ...ctx,
            auth,
            personId: auth.sessionClaims.rt_person_id,
            teamSlug: auth.orgSlug!, 
        } satisfies AuthenticatedTeamContext,
    })
})


export const systemAdminProcedure = t.procedure.use((opts) => {
    const { auth, ...ctx } = opts.ctx

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })
    if(auth.sessionClaims.rt_system_role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: "Not a system admin" })

    return opts.next({
        ctx: {
            ...ctx,
            auth,
            personId: auth.sessionClaims.rt_person_id,
        } satisfies AuthenticatedContext,
    })
})

export const systemOrTeamAdminProcedure = t.procedure.use((opts) => {
    const { auth, ...ctx } = opts.ctx

    if(auth.userId == null) throw new TRPCError({ code: 'UNAUTHORIZED' })
    if(auth.sessionClaims.rt_system_role == 'admin' || (auth.orgId != null && auth.orgRole === 'org:admin')) {
        return opts.next({
            ctx: {
                ...ctx,
                auth,
                personId: auth.sessionClaims.rt_person_id,
            } satisfies AuthenticatedContext,
        })
    }
    throw new TRPCError({ code: 'FORBIDDEN', message: "Not a system or team admin" })
    
})