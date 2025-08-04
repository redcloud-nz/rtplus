/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as DF from 'date-fns'
import createFetchClient, { Client } from 'openapi-fetch'
import createClient, { OpenapiQueryClient } from 'openapi-react-query'
import { match } from 'ts-pattern'

import { Team, TeamD4hInfo } from '@prisma/client'
import { QueryKey, UseQueryResult, UseSuspenseQueryResult } from '@tanstack/react-query'

import { D4hAccessTokenData } from '../d4h-access-tokens'
import type { paths } from './schema'
import { getD4hServer } from './servers'
import { D4hEvent } from './event'
import { D4hMember } from './member'




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

export function getD4hFetchClient(accessToken: Pick<D4hAccessTokenData, 'id' | 'serverCode' | 'value'>, { cache = true }: D4hClientOptions = {}): D4hFetchClient {
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

export function getD4hApiQueryClient(accessToken: Pick<D4hAccessTokenData, 'id' | 'serverCode' | 'value'>, { cache = true }: D4hClientOptions = {}): D4hApiQueryClient {
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

type EventParamOptions = { refDate: Date, scope: 'future' | 'past' | 'year' | 'month' } | { scope: 'range' , after: Date, before: Date }

export interface FetchListQueryOptions<TData> {
    queryFn: () => Promise<D4hListResponse<TData>>
    queryKey: QueryKey
}

export const D4hClient = {
    events: {
        queryKey({ teamId, type, ...options }: { teamId: number, type: 'events' | 'exercises' | 'incidents'} & EventParamOptions): QueryKey {
            return ['d4h', 'teams', teamId, type, this.buildQueryParams(options)] as const
        },
        queryOptions(accessToken: Pick<D4hAccessTokenData, 'id' | 'serverCode' | 'value'>, { teamId, type, ...options }: { teamId: number, type: 'events' | 'exercises' | 'incidents' } & EventParamOptions): FetchListQueryOptions<D4hEvent> {
            const queryParams = this.buildQueryParams(options)
            const fetchClient = getD4hFetchClient(accessToken)

            const params = {
                path: { context: 'team', contextId: teamId },
                query: queryParams
            } as const

            return {
                queryKey: this.queryKey({ teamId, type, ...options }),
                queryFn: async () => {
                    const { data, error } = await fetchClient.GET(`/v3/{context}/{contextId}/${type}`, { params })
                    if (error) throw error
                    const { results, ...response } = data as D4hListResponse<D4hEvent>
                    return {
                        ...response,
                        results: results.map(event => ({
                            ...event,
                            type: ({ events: 'event', exercises: 'exercise', incidents: 'incident' } as const)[type]
                        }))
                    } satisfies D4hListResponse<D4hEvent>
                },
            }
        },
        buildQueryParams(options: EventParamOptions): { after?: string, before?: string } {
            return match(options)
                .with({ scope: 'future' }, ({ refDate }) => ({ after: DF.startOfDay(refDate).toISOString() }))
                .with({ scope: 'past' }, ({ refDate }) => ({ before: DF.endOfDay(refDate).toISOString() }))
                .with({ scope: 'year' }, ({ refDate }) => ({
                    after: DF.startOfYear(refDate).toISOString(),
                    before: DF.endOfYear(refDate).toISOString()
                }))
                .with({ scope: 'month' }, ({ refDate }) => ({
                    after: DF.startOfMonth(refDate).toISOString(),
                    before: DF.endOfMonth(refDate).toISOString()
                }))
                .with({ scope: 'range' }, ({ after, before }) => ({
                    after: DF.startOfDay(after).toISOString(),
                    before: DF.endOfDay(before).toISOString()
                }))
                .exhaustive()
        }
    },
    members: {
        queryKey({ teamId }: { teamId: number }) {
            return ['d4h', 'teams', teamId, 'members'] as const
        },
        queryOptions(accessToken: Pick<D4hAccessTokenData, 'id' | 'serverCode' | 'value'>, { teamId }: { teamId: number }): FetchListQueryOptions<D4hMember> {
            const fetchClient = getD4hFetchClient(accessToken)

            return {
                queryKey: this.queryKey({ teamId }), 
                queryFn: async () => {

                    const { data, error } = await fetchClient.GET('/v3/{context}/{contextId}/members', { params: {
                        path: { context: 'team', contextId: teamId },
                        query: { status: ['OPERATIONAL', 'NON_OPERATIONAL', 'OBSERVER'] }
                    } })
                    if (error) throw error
                    return data as D4hListResponse<D4hMember>
                }
            }
        }               
    }
} as const 