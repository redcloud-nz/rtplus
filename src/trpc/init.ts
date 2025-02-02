/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { initTRPC } from '@trpc/server'
import { cache } from 'react'
import superjson from 'superjson'

export const createTRPCContext = () => {
    return { userId: 'user_123' }
}

// Avoid exporing the entire t-object
const t = initTRPC.create({
    transformer: superjson
})


// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactor = t.createCallerFactory
export const baseProcedure = t.procedure