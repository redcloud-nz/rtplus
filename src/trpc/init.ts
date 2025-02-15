/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cache } from 'react'
import superjson from 'superjson'

import { auth } from '@clerk/nextjs/server'
import {  initTRPC, TRPCError } from '@trpc/server'

import { createRTPlusAuth, RTPlusAuthObject } from '@/server/auth'
import prisma from '@/server/prisma'


export const createTRPCContext = cache(async () => {
    const clerkAuth = await auth()
    return { 
        prisma,
        clerkAuth,
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

export type AuthenticatedContext = Omit<Context, 'clerkAuth'> & RTPlusAuthObject

export const authenticatedProcedure = t.procedure.use((opts) => {
    const { clerkAuth, ...ctx} = opts.ctx

    if (clerkAuth.userId === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return opts.next({
        ctx: {
            ...ctx,
            ...createRTPlusAuth(clerkAuth)
        } satisfies AuthenticatedContext
    })
})

export type AuthenticatedTeamContext = AuthenticatedContext & { clerkOrgId: string }

export const teamProcedure = t.procedure.use((opts) => {
    const { clerkAuth, ...ctx } = opts.ctx
    
    if (clerkAuth.userId == null || clerkAuth.orgId == null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return opts.next({
        ctx: { 
            ...ctx, 
            ...createRTPlusAuth(clerkAuth),
            clerkOrgId: clerkAuth.orgId
        } satisfies AuthenticatedTeamContext,
        
    })
})