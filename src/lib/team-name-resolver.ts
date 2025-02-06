/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { Team } from '@prisma/client'


export function createTeamNameResolver(teams: Team[]) {
    const teamNames = new Map<number, string>()
    for(const team of teams) {
        if(team.d4hTeamId) teamNames.set(team.d4hTeamId, team.name)
    }

    return (d4hTeamId: number) => teamNames.get(d4hTeamId) || `Team ${d4hTeamId}`
}