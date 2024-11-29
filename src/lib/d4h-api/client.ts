import createFetchClient, { Client } from 'openapi-fetch'
import createClient, { OpenapiQueryClient } from 'openapi-react-query'

import { UseQueryResult } from '@tanstack/react-query'

import type { paths } from './schema'
import { Team } from '@prisma/client'


export interface D4hKeyRef {
    id: string
    key: string
    team: Pick<Team, 'd4hApiUrl' | 'd4hTeamId'>
}

export interface D4hClientOptions {
    cache?: boolean
}


export const DefaultD4hApiUrl = 'https://api.team-manager.ap.d4h.com'

export const D4hFetchClient = createFetchClient<paths>({ baseUrl: 'https://api.team-manager.ap.d4h.com' })

export const D4hApi = createClient(D4hFetchClient)

export type D4hFetchClient =  Client<paths, `${string}/${string}`>

const fetchClients = new Map<string, D4hFetchClient>()

export function getD4hFetchClient(keyRef: D4hKeyRef, { cache = false }: D4hClientOptions = {}): D4hFetchClient {
    let fetchClient = cache ? fetchClients.get(keyRef.id) : undefined
    if(!fetchClient) {
        fetchClient = createFetchClient({ baseUrl: keyRef.team.d4hApiUrl })
        fetchClient.use({
            onRequest({ request }) {
                request.headers.set('Authorization', `Bearer ${keyRef.key}`)
                return request
            }
        })

        if(cache) fetchClients.set(keyRef.id, fetchClient)
    }
    return fetchClient
}


export type D4hApiQueryClient = OpenapiQueryClient<paths, `${string}/${string}`>

const queryClients = new Map<string, D4hApiQueryClient>()

export function getD4hApiQueryClient(keyRef: D4hKeyRef, { cache = true }: D4hClientOptions = {}): D4hApiQueryClient {
    let queryClient = cache ? queryClients.get(keyRef.id) : undefined
    if(!queryClient) {
        queryClient = createClient(getD4hFetchClient(keyRef, { cache }))
        if(cache) queryClients.set(keyRef.id, queryClient)
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