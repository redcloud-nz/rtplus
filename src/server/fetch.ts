/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { PersonData } from '@/lib/schemas/person'
import { SkillData } from '@/lib/schemas/skill'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { TeamData } from '@/lib/schemas/team'
import { TeamMembershipData } from '@/lib/schemas/team-membership'
import { getQueryClient, trpc } from '@/trpc/server'


/**
 * Fetch a person by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * @param params The parameters containing the person ID.
 * @returns A promise that resolves to a PersonData object.
 * @throws Will throw an error if the person is not found.
 */
export async function fetchPerson(params: Promise<{ person_id: string }>): Promise<PersonData> {
    const { person_id: personId } = await params

    return getQueryClient().fetchQuery(trpc.personnel.byId.queryOptions({ personId }))
}

/**
 * Fetch a skill package by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * @param params The parameters containing the skill ID.
 * @returns A promise that resolves to a SkillDataWithPackageAndGroup object.
 * @throws Will throw an error if the skill is not found.
 */
export async function fetchSkill(params: Promise<{ skill_id: string, skill_package_id: string }>): Promise<SkillData & { skillPackage: SkillPackageData, skillGroup: SkillGroupData }> {
    const { skill_id: skillId, skill_package_id: skillPackageId } = await params
    
    return getQueryClient().fetchQuery(trpc.skills.byId.queryOptions({ skillId, skillPackageId }))
}

/**
 * Fetch a skill group by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * @param params The parameters containing the skill group ID.
 * @returns A promise that resolves to a SkillGroupDataWithPackage object.
 * @throws Will throw an error if the skill group is not found.
 */
export async function fetchSkillGroup(params: Promise<{ skill_group_id: string, skill_package_id: string }>): Promise<SkillGroupData & { skillPackage: SkillPackageData }> {
    const { skill_group_id: skillGroupId, skill_package_id: skillPackageId } = await params

    return getQueryClient().fetchQuery(trpc.skillGroups.byId.queryOptions({ skillGroupId, skillPackageId }))
}

/**
 * Fetch a skill package by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * @param params The parameters containing the skill package ID.
 * @returns A promise that resolves to a SkillPackageData object.
 * @throws Will throw an error if the skill package is not found.
 */
export async function fetchSkillPackage(params: Promise<{ skill_package_id: string }>): Promise<SkillPackageData> {
    const { skill_package_id: skillPackageId } = await params
    
    return getQueryClient().fetchQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))

}

/**
 * Fetch a team by its ID through the TRPC query client to ensure the data is available for both server and client components.
 * @param params The parameters containing the team ID.
 * @returns A promise that resolves to a TeamData object.
 * @throws Will throw an error if the team is not found.
 */
export async function fetchTeam(params: Promise<{ team_id: string }>): Promise<TeamData>  {
    const { team_id: teamId } = await params

    return getQueryClient().fetchQuery(trpc.teams.byId.queryOptions({ teamId }))
}

/**
 * Fetch a team by its slug through the TRPC query client to ensure the data is available for both server and client components.
 * @param params The parameters containing the team slug.
 * @returns A promise that resolves to a TeamData object.
 * @throws Will throw an error if the team is not found.
 */
export async function fetchTeamBySlug(params: Promise<{ team_slug: string }>): Promise<TeamData> {
    const { team_slug: teamSlug } = await params
    return getQueryClient().fetchQuery(trpc.teams.bySlug.queryOptions({ teamSlug }))
}

/**
 * Fetch a team membership by its person and team IDs through the TRPC query client to ensure the data is available for both server and client components.
 * @param params The parameters containing the person ID and team ID.
 * @returns A promise that resolves to a TeamMembershipDataWithPersonAndTeam object.
 * @throws Will throw an error if the team membership is not found.
 */
export async function fetchTeamMembership(params: Promise<{ person_id: string, team_id: string }>): Promise<TeamMembershipData & { person: PersonData, team: TeamData }> {
    const { person_id: personId, team_id: teamId } = await params

    return getQueryClient().fetchQuery(trpc.teamMemberships.byId.queryOptions({ personId, teamId }))
}