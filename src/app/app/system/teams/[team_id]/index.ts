/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/teams/[team_id]
 */


import { notFound } from 'next/navigation'
import { cache } from 'react'

import { Team } from '@prisma/client'

import prisma from '@/server/prisma'


export interface TeamParams { team_id: string }

export const getTeam = cache(async (params: Promise<TeamParams>): Promise<Team> => {
    const { team_id: teamId } = await params
    const team = await prisma.team.findUnique({ where: { id: teamId } })

    return team ?? notFound()
})