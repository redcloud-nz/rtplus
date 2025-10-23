/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/admin/skill-packages/[skill_package_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillPackage } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { AdminModule_SkillPackage_Details } from './skill-package-details'
import { AdminModule_SkillPackage_GroupsList } from './skill-package-groups-list'
import { AdminModule_SkillPackage_SkillsList } from './skill-package-skills-list'



export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/skill-packages/[skill_package_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skillPackage = await fetchSkillPackage({ orgId: organization.orgId, skillPackageId })
    return { title: `${skillPackage.name} - Skill Packages` }
}

export default async function AdminModule_SkillPackage_Page(props: PageProps<'/orgs/[org_slug]/admin/skill-packages/[skill_package_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skillPackage = await fetchSkillPackage({ orgId: organization.orgId, skillPackageId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).admin, 
                Paths.org(orgSlug).admin.skillPackages,
                skillPackage.name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Package">{skillPackage.name}</PageTitle>    
            </PageHeader>
            <Boundary>
                <AdminModule_SkillPackage_Details organization={organization} skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <AdminModule_SkillPackage_GroupsList organization={organization} skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <AdminModule_SkillPackage_SkillsList organization={organization} skillPackageId={skillPackageId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}