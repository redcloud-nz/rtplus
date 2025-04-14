/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'


import { z } from 'zod'

import { useQuery } from '@tanstack/react-query'


const LOCAL_STORAGE_KEY = 'rtplus/d4h-access-tokens'

const accessTokenSchema = z.object({
    id: z.string().uuid(),
    label: z.string(),
    value: z.string(),
    serverCode: z.enum(['ap', 'eu', 'us']),
    createdAt: z.string().datetime(),
    teams: z.array(z.object({
        id: z.number().int(),
        name: z.string(),
    }))
})

export type D4hAccessToken = z.infer<typeof accessTokenSchema>


export function getAccessTokens(): D4hAccessToken[] {
    const fromStorage = localStorage.getItem(LOCAL_STORAGE_KEY)

    const parsed = JSON.parse(fromStorage || '[]') as object[]

    const validated = parsed.map((item) => {
        try {
            return accessTokenSchema.parse(item)
        } catch (e) {
            console.error('Error parsing access token:', e)
            return null
        }
        
    }).filter((item): item is D4hAccessToken => item !== null)

    return validated
}

export function addAccessToken(token: D4hAccessToken) {
    const tokens = getAccessTokens()
    const newTokens = [...tokens, token]
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTokens))
}

export function removeAccessToken(id: string) {
    const tokens = getAccessTokens()
    const newTokens = tokens.filter(token => token.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTokens))
}

export function useAccessTokensQuery() {

    return useQuery({
        queryKey: ['d4h-access-tokens'],
        queryFn: getAccessTokens,
    })
}