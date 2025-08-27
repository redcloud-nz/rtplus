/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


export const Messages = {
    personNotAUser: (personId: string) => `Person(${personId}) is not configured as a user.`,
    personNotFound: (personId: string) => `Person(${personId}) not found.`,
    teamForbidden: (teamId: string) => `You do not have access to team(${teamId}).`,
    teamNotFound: (teamId: string) => `Team(${teamId}) not found.`,
    teamMembershipNotFound: (personId: string, teamId: string) => `Team membership not found for Person(${personId}) and Team(${teamId}).`
}