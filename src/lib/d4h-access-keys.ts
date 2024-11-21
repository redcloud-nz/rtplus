
import { User } from '@clerk/nextjs/server'

import prisma from './prisma'

import 'server-only'


export interface D4hAccessKeys {
    keys: D4hAccessKeys.KeyInfo[]
    resolveTeamName(d4hTeamId: number): string
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace D4hAccessKeys {

    export interface KeyInfo {
        key: string, 
        d4hTeamId: number, 
        context: { context: 'team', contextId: number }
        header: { Authorization: string }
    }
}

export async function getD4hAccessKeys(user: User): Promise<D4hAccessKeys> {

    const records = await prisma.d4hAccessKey.findMany({
        select: { 
            id: true,
            key: true,
            team: {
                select: { 
                    id: true,
                    name: true,
                    code: true,
                    d4hTeamId: true
                }

            }
        },
        where: { personId: user.publicMetadata.personId, enabled: true } 
    })

    const keys = records.map(keyRecord => ({
        key: keyRecord.key,
        d4hTeamId: keyRecord.team.d4hTeamId,
        context: { context: 'team', contextId: keyRecord.team.d4hTeamId },
        header: { Authorization: `Bearer ${keyRecord.key}` }
    } satisfies D4hAccessKeys.KeyInfo))

    function resolveTeamName(d4hTeamId: number) {
        for(const record of records) {
            if(record.team.d4hTeamId == d4hTeamId) return record.team.code || record.team.name 
        }
        return ""
    }

    return { keys, resolveTeamName }
}