/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill_package_id]/groups/[skill_group_id]
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'

import prisma from '@/server/prisma'
import { SkillGroupWithPackage } from '@/trpc/types'


export interface SkillGroupParams { skill_package_id: string, skill_group_id: string }


export const getSkillGroup = cache(async (params: Promise<SkillGroupParams>): Promise<SkillGroupWithPackage> => {
    const { skill_package_id: skillPackageId, skill_group_id: skillGroupId } = await params
    const skillGroup = await prisma.skillGroup.findUnique({
        where: { id: skillGroupId, skillPackageId },
        include: {
            skillPackage: true,
            parent: true
        }
    })

    return skillGroup ?? notFound()
})