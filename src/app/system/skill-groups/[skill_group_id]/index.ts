/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-groups/[skill_group_id]
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'

import { SkillGroup } from '@prisma/client'

import prisma from '@/server/prisma'

export interface SkillGroupParams { skill_group_id: string }

export const getSkillGroup = cache(async (params: Promise<SkillGroupParams>): Promise<SkillGroup> => {
    const { skill_group_id: skillGroupid } = await params
    const skillGroup = await prisma.skillGroup.findUnique({ where: { id: skillGroupid } })

    return skillGroup ?? notFound()
})