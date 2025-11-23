/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { cacheTag, revalidateTag } from 'next/cache'

import { OrganizationId } from '@/lib/schemas/organization'
import { SkillPackageData, SkillPackageId, toSkillPackageData } from '@/lib/schemas/skill-package'

import prisma from './prisma'




export async function getSkillPackage(orgId: OrganizationId, skillPackageId: string): Promise<SkillPackageData | null> {
    'use cache'
    cacheTag(`skill-package-${skillPackageId}`)

    const skillPackageIdParsed = SkillPackageId.schema.safeParse(skillPackageId)
    if(!skillPackageIdParsed.success) return null

    // Fetch skill package record
    const skillPackage = await prisma.skillPackage.findUnique({
        where: { ownerOrgId: orgId, skillPackageId }
    })

    return skillPackage ? toSkillPackageData(skillPackage) : null
}

export async function revalidateSkillPackage(skillPackageId: SkillPackageId) {
    revalidateTag(`skill-package-${skillPackageId}`, { expire: 0 })
}