/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import type { Person, Skill, SkillGroup, SkillPackage, Team, TeamMembership, TeamMembershipD4hInfo } from '@prisma/client'

export { TeamMembershipRole } from '@prisma/client'

export type DeleteType = 'Soft' | 'Hard'

export class FieldConflictError extends Error {
    constructor(fieldName: string) {
        super(fieldName)
        this.name = 'FieldConflictError'
    }
}

export interface PersonAccess {

}

export type PersonBasic = Pick<Person, 'id' | 'name' | 'email' | 'status'>

export type SkillPackageWithGroupsAndSkills = SkillPackage & { 
    skillGroups: SkillGroup[]
    skills: Skill[]
}

export type TeamBasic = Pick<Team, 'id' | 'name' | 'slug' | 'shortName' | 'color' | 'status'>

export type TeamMembershipBasic = Pick<TeamMembership, 'id' | 'personId' | 'teamId' | 'role' | 'status'>

export type TeamMembershipWithPerson = TeamMembershipBasic & { person: PersonBasic }

export type TeamMembershipWithTeam = TeamMembershipBasic & { team: TeamBasic }

export type TeamMembershipWithPersonAndTeam = TeamMembershipBasic & { person: PersonBasic, team: TeamBasic }
