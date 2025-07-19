/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { createTRPCOptionsProxy, TRPCQueryOptions } from '@trpc/tanstack-react-query'

import { createTRPCContext } from './init'
import { makeQueryClient } from './query-client'
import { appRouter } from './routers/_app'

export * from './types'

// Create a stable getter for the query client
export const getQueryClient = cache(makeQueryClient)

//const caller = createCallerFactor(appRouter)(createTRPCContext)

//export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(caller, getQueryClient)

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

export function HydrateClient({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
    )
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
    const queryClient = getQueryClient()
    if(queryOptions.queryKey[1]?.type === 'infinite') {
        void queryClient.prefetchInfiniteQuery(queryOptions as any)
    } else {
        void queryClient.prefetchQuery(queryOptions)
    }
}