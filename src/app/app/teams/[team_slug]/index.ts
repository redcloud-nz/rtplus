/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'

import { Team } from '@prisma/client'

import prisma from '@/server/prisma'



export interface TeamParams { team_slug: string }

export const getTeam = cache(async (params: Promise<TeamParams>): Promise<Team> => {
    const { team_slug: teamSlug } = await params

    const team = await prisma.team.findUnique({ where: { slug: teamSlug } })
    
    return team ?? notFound()
})