/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import type { Person, Skill, SkillGroup, SkillPackage, Team, TeamMembership, TeamMembershipD4hInfo } from '@prisma/client'

export type DeleteType = 'Soft' | 'Hard'

export class FieldConflictError extends Error {
    constructor(fieldName: string) {
        super(fieldName)
        this.name = 'FieldConflictError'
    }
}

export type SkillPackageWithGroupsAndSkills = SkillPackage & { 
    skillGroups: SkillGroup[]
    skills: Skill[]
}

export type TeamMembershipWithPerson = TeamMembership & { d4hInfo: TeamMembershipD4hInfo | null, person: Person }

export type TeamMembershipWithTeam = TeamMembership & { d4hInfo: TeamMembershipD4hInfo | null, team: Team }

export type TeamMembershipWithPersonAndTeam = TeamMembership & { d4hInfo: TeamMembershipD4hInfo | null, person: Person, team: Team }