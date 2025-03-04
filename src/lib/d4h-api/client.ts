/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import createFetchClient, { Client } from 'openapi-fetch'
import createClient, { OpenapiQueryClient } from 'openapi-react-query'

import { Team, TeamD4hInfo } from '@prisma/client'
import { UseQueryResult } from '@tanstack/react-query'

import { D4hAccessToken } from '../d4h-access-tokens'
import type { paths } from './schema'
import { getD4hServer } from './servers'



export interface D4hKeyRef {
    id: string
    key: string
    team: Team
    d4hInfo: TeamD4hInfo
}

export interface D4hClientOptions {
    cache?: boolean
}

export type D4hFetchClient =  Client<paths, `${string}/${string}`>

const cachedFetchClients = new Map<string, D4hFetchClient>()

export function getD4hFetchClient(accessToken: D4hAccessToken, { cache = true }: D4hClientOptions = {}): D4hFetchClient {
    const server = getD4hServer(accessToken.serverCode)
    let fetchClient = cachedFetchClients.get(accessToken.id)
    if(!fetchClient) {
        fetchClient = createFetchClient({ baseUrl: server.apiUrl })
        fetchClient.use({
            onRequest({ request }) {
                request.headers.set('Authorization', `Bearer ${accessToken.value}`)
                return request
            }
        })
        if(cache) cachedFetchClients.set(accessToken.id, fetchClient)
    }
    return fetchClient
}


export type D4hApiQueryClient = OpenapiQueryClient<paths, `${string}/${string}`>

const queryClients = new Map<string, D4hApiQueryClient>()

export function getD4hApiQueryClient(accessToken: D4hAccessToken, { cache = true }: D4hClientOptions = {}): D4hApiQueryClient {
    let queryClient = cache ? queryClients.get(accessToken.id) : undefined
    if(!queryClient) {
        queryClient = createClient(getD4hFetchClient(accessToken, { cache }))
        if(cache) queryClients.set(accessToken.id, queryClient)
    }
    return queryClient
}


export type D4hListResponse<Model> = { results: Model[], page: number, pageSize: number, totalSize: number }

export type GetListResponseCombinerArgs<TData> = { sortFn?: (a: TData, b: TData) => number }

export function getListResponseCombiner<TData>(args: GetListResponseCombinerArgs<TData> = {}): (queryResults: UseQueryResult<unknown>[]) => { data: TData[], isError: boolean, isPending: boolean, isSuccess: boolean } {
    return function listResponseCombiner(queryResults) {
        

        const isError = queryResults.some(qr => qr.isError)
        const isPending = queryResults.some(qr => qr.isPending)
        const isSuccess = queryResults.every(qr => qr.isSuccess)

        if(isSuccess) {
            let rows: TData[] = []
            for(const result of queryResults) {
                const typedData = result.data as D4hListResponse<TData>
                
                rows.push(...typedData.results)
            }

            if(args.sortFn) rows = rows.sort(args.sortFn)

            return {
                data: rows,
                isError, isPending, isSuccess
            }
            
        } else {
            return {
                data: [],
                isError, isPending, isSuccess
            }
        }
    } 
}