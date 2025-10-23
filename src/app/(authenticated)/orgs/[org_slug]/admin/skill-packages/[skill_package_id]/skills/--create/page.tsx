/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/skill-packages/[skill_package_id]/skills/create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'

import { fetchSkillPackage } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { AdminModule_NewSkill_Form } from './new-skill'
import { Boundary } from '@/components/boundary'



export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>): Promise<Metadata> {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skillPackage = await fetchSkillPackage({ orgId: organization.orgId, skillPackageId })
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function AdminModule_NewSkill_Page(props: PageProps<'/orgs/[org_slug]/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skillPackage = await fetchSkillPackage({ orgId: organization.orgId, skillPackageId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.skillPackages,
                { label: skillPackage.name, href: Paths.org(orgSlug).admin.skillPackage(skillPackage.skillPackageId).href },
                Paths.org(orgSlug).admin.skillPackage(skillPackage.skillPackageId).skills,
                Paths.org(orgSlug).admin.skillPackage(skillPackage.skillPackageId).skills.create
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle>New Skill</PageTitle>
                <PageDescription>Create a new skill within this skill package.</PageDescription>
            </PageHeader>
            
            <Boundary>
                <AdminModule_NewSkill_Form organization={organization} skillPackageId={skillPackage.skillPackageId} />
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}
