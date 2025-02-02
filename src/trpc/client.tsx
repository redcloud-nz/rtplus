/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
'use client'

import { useState } from 'react'
import superjson from 'superjson'

import { type QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'

import { makeQueryClient } from './query-client'
import type { AppRouter } from './routers/_app'


export const trpc = createTRPCReact<AppRouter>()

let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
    if(isServer) {
        // Server, always make a new query client
        return makeQueryClient()
    } else {
        // Browser, use singleton pattern
        return (clientQueryClientSingleton ??= makeQueryClient())
    }
}

function getUrl() {
    const base = (() => {
        if(typeof window !== 'undefined') return ''
        else if(process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
        else return 'http://localhost:3000'
    })()

    return `${base}/api/trpc`
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()
    const [trpcClient] = useState((() => 
        trpc.createClient({
            links: [
                httpBatchLink({
                    transformer: superjson,
                    url: getUrl()
                }),
            ]
        })
    ))

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    )
}