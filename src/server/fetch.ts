/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { notFound } from 'next/navigation'

import { TRPCError } from '@trpc/server'

import { PersonData, PersonRef, toPersonData } from '@/lib/schemas/person'
import { SkillData } from '@/lib/schemas/skill'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { TeamData } from '@/lib/schemas/team'
import { TeamMembershipData, toTeamMembershipData } from '@/lib/schemas/team-membership'
import { getQueryClient, trpc } from '@/trpc/server'

import prisma from './prisma'
import { getTeamFromParams } from './data/team'

/**
 * Fetch a person by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the person ID.
 * @returns A promise that resolves to a PersonData object.
 */
export async function fetchPerson(params: Promise<{ person_id: string }>): Promise<PersonData> {
    const { person_id: personId } = await params

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
export async function fetchSkill(params: Promise<{ skill_id: string, skill_package_id: string }>): Promise<SkillData & { skillPackage: SkillPackageData, skillGroup: SkillGroupData }> {
    const { skill_id: skillId, skill_package_id: skillPackageId } = await params
    
    return getQueryClient()
        .fetchQuery(trpc.skills.getSkill.queryOptions({ skillId, skillPackageId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

export async function fetchSkillCheckSession(params: Promise<{ session_id: string }>) : Promise<SkillCheckSessionData & { team: TeamData }> {
    const { session_id: sessionId } = await params
    
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
export async function fetchSkillGroup(params: Promise<{ skill_group_id: string, skill_package_id: string }>): Promise<SkillGroupData & { skillPackage: SkillPackageData }> {
    const { skill_group_id: skillGroupId, skill_package_id: skillPackageId } = await params

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
export async function fetchSkillPackage(params: Promise<{ skill_package_id: string }>): Promise<SkillPackageData> {
    const { skill_package_id: skillPackageId } = await params
    
    return getQueryClient()
        .fetchQuery(trpc.skills.getPackage.queryOptions({ skillPackageId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}


export async function fetchTeamMember(params: Promise<{ team_slug: string, person_id: string }>): Promise<TeamMembershipData & { person: PersonRef, team: TeamData }> {
    const { person_id: personId } = await params

    const team = await getTeamFromParams(params)

    const membership = await prisma.teamMembership.findFirst({
        where: {
            teamId: team.teamId,
            personId
        },
        include: { person: true }
    })
    if(!membership) notFound()

    const result = { 
        ...toTeamMembershipData(membership), 
        person: toPersonData(membership.person), 
        team: team
    }

    return result
}

/**
 * Fetch a team membership by its person ID and team ID through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the person ID and team ID.
 * @returns A promise that resolves to a TeamMembershipDataWithPersonAndTeam object.

 */
export async function fetchTeamMembership(params: Promise<{ person_id: string, team_id: string }>): Promise<TeamMembershipData & { person: PersonData, team: TeamData }> {
    const { person_id: personId, team_id: teamId } = await params

    return getQueryClient()
        .fetchQuery(trpc.teamMemberships.getTeamMembership.queryOptions({ personId, teamId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
    })
}