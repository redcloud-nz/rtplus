/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/skill-packages/[skill_package_id]/groups/--create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillPackage } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { AdminModule_NewSkillGroup_Form } from './new-skill-group'




export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/skill-packages/[skill_package_id]/groups/--create'>): Promise<Metadata> {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skillPackage = await fetchSkillPackage({ orgId: organization.orgId, skillPackageId })
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function AdminModuleNewSkillGroup_Page(props: PageProps<'/orgs/[org_slug]/admin/skill-packages/[skill_package_id]/groups/--create'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skillPackage = await fetchSkillPackage({ orgId: organization.orgId, skillPackageId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.skillPackages,
                { label: skillPackage.name, href: Paths.org(orgSlug).admin.skillPackage(skillPackageId).href },
                Paths.org(orgSlug).admin.skillPackage(skillPackageId).groups,
                Paths.org(orgSlug).admin.skillPackage(skillPackageId).groups.create
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle>New Skill Group</PageTitle>
                <PageDescription>Create a new skill group within this skill package.</PageDescription>
            </PageHeader>
            
            <Boundary>
                <AdminModule_NewSkillGroup_Form organization={organization} skillPackageId={skillPackageId} />
            </Boundary>
            
        </AppPageContent>
    </AppPage>
}
