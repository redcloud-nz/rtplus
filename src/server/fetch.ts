/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { notFound } from 'next/navigation'

import { TRPCError } from '@trpc/server'

import { OrganizationId } from '@/lib/schemas/organization'
import { PersonData } from '@/lib/schemas/person'
import { SkillData } from '@/lib/schemas/skill'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { TeamData } from '@/lib/schemas/team'
import { TeamMembershipData } from '@/lib/schemas/team-membership'
import { getQueryClient, trpc } from '@/trpc/server'



/**
 * Fetch a person by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the person ID.
 * @returns A promise that resolves to a PersonData object.
 */
export async function fetchPerson({ orgId, personId }: { orgId: OrganizationId, personId: string }): Promise<PersonData> {
    return getQueryClient()
        .fetchQuery(trpc.personnel.getPerson.queryOptions({ personId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

/**
 * Fetch a skill package by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the skill ID.
 * @returns A promise that resolves to a SkillDataWithPackageAndGroup object.
 */
export async function fetchSkill({ orgId, skillId, skillPackageId }: { orgId: OrganizationId, skillId: string, skillPackageId: string }): Promise<SkillData & { skillPackage: SkillPackageData, skillGroup: SkillGroupData }> {
    
    return getQueryClient()
        .fetchQuery(trpc.skills.getSkill.queryOptions({ skillId, skillPackageId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

export async function fetchSkillCheckSession({ orgId, sessionId }: { orgId: OrganizationId, sessionId: string }) : Promise<SkillCheckSessionData> {
    
    return getQueryClient()
        .fetchQuery(trpc.skillChecks.getSession.queryOptions({ sessionId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

/**
 * Fetch a skill group by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the skill group ID.
 * @returns A promise that resolves to a SkillGroupDataWithPackage object.
 */
export async function fetchSkillGroup({ orgId, skillGroupId, skillPackageId }: { orgId: OrganizationId, skillGroupId: string, skillPackageId: string }): Promise<SkillGroupData & { skillPackage: SkillPackageData }> {
    
    return getQueryClient()
        .fetchQuery(trpc.skills.getGroup.queryOptions({ skillGroupId, skillPackageId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

/**
 * Fetch a skill package by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the skill package ID.
 * @returns A promise that resolves to a SkillPackageData object.
 */
export async function fetchSkillPackage({ orgId, skillPackageId }: { orgId: OrganizationId, skillPackageId: string }): Promise<SkillPackageData> {
    
    return getQueryClient()
        .fetchQuery(trpc.skills.getPackage.queryOptions({ skillPackageId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

/**
 * Fetch a team membership by its person ID and team ID through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the person ID and team ID.
 * @returns A promise that resolves to a TeamMembershipDataWithPersonAndTeam object.

 */
export async function fetchTeamMembership({ orgId, personId, teamId }: { orgId: string, personId: string, teamId: string }): Promise<TeamMembershipData & { person: PersonData, team: TeamData }> {
    return getQueryClient()
        .fetchQuery(trpc.teamMemberships.getTeamMembership.queryOptions({ personId, teamId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
    })
}


export async function fetchCurrentPerson(): Promise<PersonData | null> {
    return getQueryClient()
        .fetchQuery(trpc.personnel.getCurrentPerson.queryOptions())
}