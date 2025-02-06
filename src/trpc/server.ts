/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import 'server-only'

import { cache } from 'react'

import { createHydrationHelpers } from '@trpc/react-query/rsc'

import { createCallerFactor, createTRPCContext } from './init'
import { makeQueryClient } from './query-client'
import { appRouter } from './routers/_app'


export * from './types'

// Create a stable getter for the query client
export const getQueryClient = cache(makeQueryClient)

const caller = createCallerFactor(appRouter)(createTRPCContext)

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(caller, getQueryClient)
