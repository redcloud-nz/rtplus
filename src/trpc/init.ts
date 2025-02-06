/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cache } from 'react'
import superjson from 'superjson'

import { auth } from '@clerk/nextjs/server'
import {  initTRPC, TRPCError } from '@trpc/server'

import { createAuthObject } from '@/server/auth'
import prisma from '@/server/prisma'


export const createTRPCContext = cache(async () => {
    const authObject = await auth()

    return { 
        prisma,
        ...createAuthObject(authObject)
    }
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Avoid exporting the entire t-object
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter: ({ shape }) => shape
})


// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactor = t.createCallerFactory

export const publicProcedure = t.procedure

export const authenticatedProcedure = t.procedure.use((opts) => {
    
    if (opts.ctx.authObject.userId === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return opts.next({
        ctx: opts.ctx
    })
})
