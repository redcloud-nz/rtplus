/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { revalidateTag, unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'

import { Team as TeamRecord } from '@prisma/client'

import { TeamData, toTeamData } from '@/lib/schemas/team'

import prisma from '../prisma'


/**
 * Fetch a team by ID. Cached using unstable_cache.
 * @param teamId The ID of the team to fetch.
 * @returns A promise that resolves to the team data or null if not found.
 */
export const fetchTeamByIdCached = unstable_cache(
    async (teamId: string): Promise<TeamRecord | null> => {
        
        return await prisma.team.findUnique({
            where: { id: teamId }
        })
    },
    [],
    {
        tags: ["teams"],
        revalidate: 3600 // 1 hour
    }
)

/**
 * Fetch a team by its slug. Cached using unstable_cache.
 * @param teamSlug The slug of the team to fetch.
 * @returns A promise that resolves to the team data or null if not found.
 */
export const fetchTeamBySlugCached = unstable_cache(
    async (teamSlug: string): Promise<TeamRecord | null> => {
        // If the team is not cached, fetch it directly from the database
        return await prisma.team.findUnique({ 
            where: { slug: teamSlug } 
        })
    },
    [],
    {
        tags: ['teams'],
        revalidate: 3600 // 1 hour
    }
)

/**
 * Get a team by its slug (extracted from the URL).
 * Note: If the team is not found, this function will throw a 404 error.
 * @param params The parameters containing the team slug.
 * @returns A promise that resolves to a TeamData object.
 */
export async function getTeamFromParams(params: Promise<{ slug: string}>): Promise<TeamData>{
    const { slug: teamSlug } = await params

    const team = await fetchTeamBySlugCached(teamSlug)
    return team ? toTeamData(team) : notFound()
}


export const fetchAllTeamSlugsCached = unstable_cache(
    async (): Promise<string[]> => {
        const teams = await prisma.team.findMany({ select: { slug: true } })
        return teams.map(team => team.slug)
    },
    [],
    {
        tags: ['teams'],
        revalidate: 3600 // 1 hour
    }
)

export function revalidateTeamsCache() {
    revalidateTag('teams')
}