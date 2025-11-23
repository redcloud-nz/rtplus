/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]
 */

import { notFound } from 'next/navigation'

import { Lexington } from '@/components/blocks/lexington'
import { TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getSkillPackage } from '@/server/skills'



export async function generateMetadata(props: LayoutProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)

    const skillPackage = await getSkillPackage(organization.orgId, skillPackageId)
    if(skillPackage == null) notFound()

    return { title: `${skillPackage?.name ?? 'Skill Package'} ${TITLE_SEPARATOR} Skill Packages` }

}

export default async function AdminModule_SkillPackage_Layout(props: LayoutProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)
    
    const skillPackage = await getSkillPackage(organization.orgId, skillPackageId)
    if(skillPackage == null) notFound()

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).skillPackageManager,
                Paths.org(orgSlug).skillPackageManager.skillPackages,
                skillPackage.name
            ]}
        />
        <Lexington.Page>
            {props.children}
        </Lexington.Page>
    </Lexington.Root>
}