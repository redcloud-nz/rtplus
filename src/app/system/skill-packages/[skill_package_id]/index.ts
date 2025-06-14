/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill_package_id]
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'
import { SkillPackage } from '@prisma/client'
import prisma from '@/server/prisma'

export interface SkillPackageParams { skill_package_id: string }

export const getSkillPackage = cache(async (params: Promise<SkillPackageParams>): Promise<SkillPackage> => {
    const { skill_package_id: skillPackageId } = await params
    const skillPackage = await prisma.skillPackage.findUnique({ where: { id: skillPackageId } })

    return skillPackage ?? notFound()
})