/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_PAGE_SIZE = 1000

export type Id = string

export interface ListResponse<TData extends object> {
    status: 'SUCCESS'
    data: TData[]
    pagination: {
        totalSize: number
        pageSize: number
        totalPages: number
        currentPage: number
    }
}

export interface ObjectResponse<TData extends object> {
    status: 'SUCCESS'
    data: TData
}

export interface ErrorResponse {
    status: 'ERROR'
    message: string
}

/**
 * Create a list response which contains all records for the given query.
 */
export function createListResponse<TData extends object>(data: TData[]): Response {

    return Response.json({ 
        status: 'SUCCESS',
        data, 
        pagination: {
            totalSize: data.length,
            pageSize: data.length,
            totalPages: 1,
            currentPage: 0
        }
    })
}


export function createObjectResponse<TData extends object>(data: TData): Response {
    return Response.json({ status: 'SUCCESS', data })
}

export function createNotFoundResponse(message: string): Response {
    return Response.json({ status: 'ERROR', message }, { status: 404, statusText: 'Not Found' })
}