/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { OrganizationMembershipRole } from '@clerk/nextjs/server'
import type { Person, Skill, SkillCheck, SkillCheckSession, SkillGroup, SkillPackage, Team, TeamMembership } from '@prisma/client'

export { Skill, SkillCheck, SkillCheckSession, SkillGroup, SkillPackage }

export type DeleteType = 'Soft' | 'Hard'

export class FieldConflictError extends Error {
    constructor(fieldName: string) {
        super(fieldName)
        this.name = 'FieldConflictError'
    }
}

export interface OrganizationBasic {
    id: string
    name: string
    slug: string | null
}

export interface OrgInvitationBasic {
    id: string
    email: string
    role: OrganizationMembershipRole
    createdAt: number
}

export interface OrgMembershipBasic {
    id: string
    role: OrganizationMembershipRole
    user: UserBasic
    organization: OrganizationBasic
    createdAt: number
    updatedAt: number
}

export interface PersonAccess {

}

export type PersonBasic = Pick<Person, 'id' | 'name' | 'email' | 'status'>

export type SkillCheckSessionWithCounts = WithCounts<SkillCheckSession, 'assessees' | 'checks' | 'skills'>


export type SkillGroupWithPackage = SkillGroup & {
    skillPackage: SkillPackage
    parent: SkillGroup | null
}

export type SkillPackageWithGroupsAndSkills = SkillPackage & { 
    skillGroups: SkillGroup[]
    skills: Skill[]
}

export type SkillWithPackageAndGroup = Skill & {
    skillGroup: SkillGroup
    skillPackage: SkillPackage
}

export type TeamBasic = Pick<Team, 'id' | 'name' | 'slug' | 'shortName' | 'color' | 'status'>

export type TeamMembershipBasic = Pick<TeamMembership, 'personId' | 'teamId' | 'tags' | 'status'>

export type TeamMembershipWithPerson = TeamMembershipBasic & { person: PersonBasic }

export type TeamMembershipWithTeam = TeamMembershipBasic & { team: TeamBasic }

export type TeamMembershipWithPersonAndTeam = TeamMembershipBasic & { person: PersonBasic, team: TeamBasic }



export interface UserBasic {
    id: string
    identifier: string
    name: string
}


export type WithCounts<T, S extends string> = T & { _count: Record<S, number> }