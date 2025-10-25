/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'


import { z } from 'zod'

function createStorageKey(userId: string) {
    return `rtplus/d4h-access-tokens/${userId}`
}

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

export type D4hAccessTokenData = z.infer<typeof accessTokenSchema>

export function getAccessTokens(userId: string): D4hAccessTokenData[] {
    const fromStorage = window.localStorage?.getItem(createStorageKey(userId)) ?? ''

    const parsed = JSON.parse(fromStorage || '[]') as object[]

    const validated = parsed.map((item) => {
        try {
            return accessTokenSchema.parse(item)
        } catch (e) {
            console.error('Error parsing access token:', e)
            return null
        }
        
    }).filter((item): item is D4hAccessTokenData => item !== null && item.teams.length > 0)

    return validated
}

export function addAccessToken(userId: string, token: D4hAccessTokenData) {
    const tokens = getAccessTokens(userId)
    const newTokens = [...tokens, token]
    localStorage.setItem(createStorageKey(userId), JSON.stringify(newTokens))
}

export function updateAccessToken(userId: string, id: string, updatedToken: Partial<D4hAccessTokenData>) {
    const tokens = getAccessTokens(userId)
    const newTokens = tokens.map(token => 
        token.id === id ? { ...token, ...updatedToken } : token
    )
    localStorage.setItem(createStorageKey(userId), JSON.stringify(newTokens))
}

export function removeAccessToken(userId: string, id: string) {
    const tokens = getAccessTokens(userId)
    const newTokens = tokens.filter(token => token.id !== id)
    localStorage.setItem(createStorageKey(userId), JSON.stringify(newTokens))
}


export const D4hAccessTokens = {
    queryKey(userId: string) {
        return ['d4h-access-tokens', userId] as const
    },
    queryOptions(userId: string) {
         return {
            queryKey: this.queryKey(userId),
            queryFn: () => getAccessTokens(userId),
        } as const
    }
}

/**
 * Extract the unique teams associated with the specified D4H access tokens.
 * This will return a list of unique teams, each with the access token that provides access to that team.
 * If a team is found on multiple access tokens, it will only be included once.
 * 
 * @param accessTokens - The D4H access tokens to extract teams from.
 * @returns An array of objects containing the team and the access token that provides access to that team.
 * @throws Error if a team is found on multiple access tokens with different server codes.
 */
export function extractUniqueTeams(accessTokens: D4hAccessTokenData[]): { team : { id: number, name: string }, accessToken: Omit<D4hAccessTokenData, 'teams'> }[] {
    const uniqueTeams = new Map<number, { team: { id: number, name: string }, accessToken: D4hAccessTokenData }>()

    for(const token of accessTokens) {
        for(const team of token.teams) {
            if(uniqueTeams.has(team.id)) {
                // Team ID is already present, check to make sure it's on the same server
                const existing = uniqueTeams.get(team.id)!
                if(existing.accessToken.serverCode !== token.serverCode) {
                    throw new Error(`Duplicate team ID ${team.id} found on different servers: ${existing.accessToken.serverCode} vs ${token.serverCode}. Skipping team.`)
                }
            } else {
                uniqueTeams.set(team.id, { team, accessToken: token })
            }
        }
    }

    return Array.from(uniqueTeams.values())

}