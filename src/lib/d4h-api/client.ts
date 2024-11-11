import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'

import type { paths } from './schema'
import { UseQueryResult } from '@tanstack/react-query'

export const D4hFetchClient = createFetchClient<paths>({ baseUrl: 'https://api.team-manager.ap.d4h.com' })

export const D4hApi = createClient(D4hFetchClient)

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