/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { cacheTag, revalidateTag } from 'next/cache'
import { notFound } from 'next/navigation'


import { OrganizationData, toOrganizationData } from '@/lib/schemas/organization'

import { getClerkClient } from './clerk'
import prisma from './prisma'


export async function getOrganization(orgSlug: string): Promise<OrganizationData> {
    'use cache'
    cacheTag(`organization-${orgSlug}`)

    const clerk = getClerkClient()
    const clerkOrg = await clerk.organizations.getOrganization({ slug: orgSlug })

    if(!clerkOrg) return notFound()

    let orgRecord = await prisma.organization.findFirst({ where: { orgId: clerkOrg.id } })
    
    // Ensure that there is an organization record in our database
    if(!orgRecord) {
        orgRecord = await prisma.organization.create({
            data: {
                orgId: clerkOrg.id,
                name: clerkOrg.name || 'Unnamed Organization',
                settings: {},
            }
        })
    }

    return toOrganizationData(orgRecord, clerkOrg)

}

export async function revalidateOrganization(orgSlug: string) {
    revalidateTag(`organization-${orgSlug}`, { expire: 0 })
}
