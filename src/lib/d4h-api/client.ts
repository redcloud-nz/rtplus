import createFetchClient, { Client } from 'openapi-fetch'
import createClient, { OpenapiQueryClient } from 'openapi-react-query'

import { UseQueryResult } from '@tanstack/react-query'

import type { paths } from './schema'


export interface D4hKeyRef {
    accessKeyId: string
    apiUrl: string
    accessKey: string
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
    let fetchClient = cache ? fetchClients.get(keyRef.accessKeyId) : undefined
    if(!fetchClient) {
        fetchClient = createFetchClient({ baseUrl: keyRef.apiUrl })
        fetchClient.use({
            onRequest({ request }) {
                request.headers.set('Authorization', `Bearer ${keyRef.accessKey}`)
                return request
            }
        })

        if(cache) fetchClients.set(keyRef.accessKeyId, fetchClient)
    }
    return fetchClient
}


export type D4hApiQueryClient = OpenapiQueryClient<paths, `${string}/${string}`>

const queryClients = new Map<string, D4hApiQueryClient>()

export function getD4hApiQueryClient(keyRef: D4hKeyRef, { cache = true }: D4hClientOptions = {}): D4hApiQueryClient {
    let queryClient = cache ? queryClients.get(keyRef.accessKeyId) : undefined
    if(!queryClient) {
        queryClient = createClient(getD4hFetchClient(keyRef, { cache }))
        if(cache) queryClients.set(keyRef.accessKeyId, queryClient)
    }
    return queryClient
}


export type D4hListResponse<Model> = { results: Model[], page: number, pageSize: number, totalSize: number }

export type GetListResponseCombinerArgs<TData> = { sortFn?: (a: TData, b: TData) => number }

export function getListResponseCombiner<TData>(args: GetListResponseCombinerArgs<TData> = {}): (queryResults: UseQueryResult<D4hListResponse<TData>>[]) => { data: TData[], isError: boolean, isPending: boolean, isSuccess: boolean } {
    return function listResponseCombiner(queryResults) {
        const isError = queryResults.some(qr => qr.isError)
        const isPending = queryResults.some(qr => qr.isPending)
        const isSuccess = queryResults.every(qr => qr.isSuccess)
        
        if(isSuccess) {
            let rows: TData[] = []
            for(const result of queryResults) {
                rows.push(...(result.data).results)
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