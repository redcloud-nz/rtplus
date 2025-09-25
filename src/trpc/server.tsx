/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import { createTRPCContext } from './init'
import { makeQueryClient } from './query-client'
import { appRouter } from './routers/_app'

export * from './types'

// Create a stable getter for the query client
export const getQueryClient = cache(makeQueryClient)


const createContext = cache(async () => {
    const heads = new Headers(await headers())
    heads.set('x-trpc-source', 'rsc')
    return createTRPCContext({ headers: heads })
})

export const trpc = createTRPCOptionsProxy({
    ctx: createContext,
    router: appRouter,
    queryClient: getQueryClient,
})