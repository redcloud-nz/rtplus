/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export type D4hServerCode = 'ap' | 'eu' | 'us'

export const D4hServerCodes = ['ap', 'eu', 'us'] as const

interface D4HServer {
    code: D4hServerCode
    apiUrl: string
    tokensUrl?: string
    name: string

}

export const D4hServerList: D4HServer[] = [
    {
        code: 'ap',
        apiUrl: 'https://api.team-manager.ap.d4h.com',
        tokensUrl: 'https://myaccount.ap.d4h.com/tokens',
        name: 'Asia Pacific',
    },
    {
        code: 'eu',
        apiUrl: 'https://api.team-manager.eu.d4h.com',
        tokensUrl: 'https://myaccount.eu.d4h.com/tokens',
        name: 'Europe',
    },
    {
        code: 'us',
        apiUrl: 'https://api.team-manager.us.d4h.com',
        tokensUrl: 'https://myaccount.us.d4h.com/tokens',
        name: 'United States',
    }
]


export function getD4hServer(code: D4hServerCode): D4HServer {
    return D4hServerList.find(server => server.code === code)!
}