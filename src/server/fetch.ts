/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { notFound } from 'next/navigation'

import { PersonData } from '@/lib/schemas/person'
import { SkillData } from '@/lib/schemas/skill'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { TeamData } from '@/lib/schemas/team'
import { TeamMembershipData } from '@/lib/schemas/team-membership'
import { getQueryClient, trpc } from '@/trpc/server'
import { TRPCError } from '@trpc/server'


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
        .fetchQuery(trpc.personnel.byId.queryOptions({ personId }))
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
        .fetchQuery(trpc.skills.byId.queryOptions({ skillId, skillPackageId }))
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
        .fetchQuery(trpc.skillGroups.byId.queryOptions({ skillGroupId, skillPackageId }))
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
        .fetchQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

/**
 * Fetch a team by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the team ID.
 * @returns A promise that resolves to a TeamData object.
 */
export async function fetchTeam(params: Promise<{ team_id: string }>): Promise<TeamData>  {
    const { team_id: teamId } = await params

    return getQueryClient()
        .fetchQuery(trpc.teams.byId.queryOptions({ teamId }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

/**
 * Fetch a team by its slug through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the team slug.
 * @returns A promise that resolves to a TeamData object.
 */
export async function fetchTeamBySlug(params: Promise<{ team_slug: string }>): Promise<TeamData> {
    const { team_slug: teamSlug } = await params
    return getQueryClient()
        .fetchQuery(trpc.teams.bySlug.queryOptions({ teamSlug }))
        .catch(error => {
            if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
                notFound()
            }
            return error
        })
}

/**
 * Fetch a team membership by its person ID and team ID (or slug) through the TRPC query client to ensure the data is available for both server and client components.
 * 
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the person ID and team ID (or slug).
 * @returns A promise that resolves to a TeamMembershipDataWithPersonAndTeam object.

 */
export async function fetchTeamMembership(params: Promise<{ person_id: string} & ({ team_slug: string } | { team_id: string })>): Promise<TeamMembershipData & { person: PersonData, team: TeamData }> {
    const awaitedPramas = await params

    return ('team_id' in awaitedPramas
        ? getQueryClient().fetchQuery(trpc.teamMemberships.byId.queryOptions({
            personId: awaitedPramas.person_id,
            teamId: awaitedPramas.team_id
        }))
        : getQueryClient().fetchQuery(trpc.teamMemberships.bySlug.queryOptions({
            personId: awaitedPramas.person_id,
            teamSlug: awaitedPramas.team_slug
        }))
    ).catch(error => {
        if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
            notFound()
        }
        return error
    })
}