/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init'

export const appRouter = createTRPCRouter({
    hello: baseProcedure
        .input(z.object({ 
            text: z.string() 
        }))
        .query(async ({ input }) => {
            return { greeting: `Hello, ${input.text}!` }
        })
})

export type AppRouter = typeof appRouter