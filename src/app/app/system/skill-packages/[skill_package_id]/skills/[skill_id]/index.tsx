/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill_package_id]/groups/[skill_group_id]
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'

import prisma from '@/server/prisma'
import { SkillWithPackageAndGroup} from '@/trpc/types'

export interface SkillParams { skill_package_id: string, skill_id: string }

export const getSkill = cache(async (params: Promise<SkillParams>): Promise<SkillWithPackageAndGroup> => {
    const { skill_package_id: skillPackageId, skill_id: skillId } = await params
    const skill = await prisma.skill.findUnique({
        where: { id: skillId, skillPackageId},
        include: {
            skillPackage: true,
            skillGroup: true
        }
    })

    return skill ?? notFound()
})