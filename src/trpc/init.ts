/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cache } from 'react'
import superjson from 'superjson'

import { auth } from '@clerk/nextjs/server'
import {  initTRPC, TRPCError } from '@trpc/server'

import { createAuthObject, RTPlusAuthObject } from '@/server/auth'
import prisma from '@/server/prisma'
import { ZodError } from 'zod'


export const createTRPCContext = cache(async () => {
    const authObject = await auth()
    return { 
        prisma,
        authObject,
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

export type AuthenticatedContext = Context & RTPlusAuthObject

export const authenticatedProcedure = t.procedure.use((opts) => {
    
    if (opts.ctx.authObject.userId === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return opts.next({
        ctx: {
            ...opts.ctx,
            ...createAuthObject(opts.ctx.authObject)
        } satisfies AuthenticatedContext
    })
})

export type AuthenticatedTeamContext = AuthenticatedContext & { orgId: string }

export const teamProcedure = t.procedure.use((opts) => {
    
    if (opts.ctx.authObject.userId == null || opts.ctx.authObject.orgId == null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return opts.next({
        ctx: { 
            ...opts.ctx, 
            ...createAuthObject(opts.ctx.authObject),
            orgId: opts.ctx.authObject.orgId
        } satisfies AuthenticatedTeamContext,
        
    })
})