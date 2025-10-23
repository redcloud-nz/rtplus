/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/skill-packages/[skill_package_id]/skills/[skill_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchSkill } from '@/server/fetch'

import { getOrganization } from '@/server/organization'
import { AdminModule_SkillDetails } from './skill-details'



export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId, skill_id: skillId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skill = await fetchSkill({ orgId: organization.orgId, skillId, skillPackageId })
    return { title: `${skill.name} - Skills` }
}

export default async function AdminModule_Skill_Page(props: PageProps<'/orgs/[org_slug]/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId, skill_id: skillId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skill = await fetchSkill({ orgId: organization.orgId, skillId, skillPackageId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.skillPackages,
                {  href: Paths.org(orgSlug).admin.skillPackage(skill.skillPackageId).href, label: skill.skillPackage.name, },
                Paths.org(orgSlug).admin.skillPackage(skill.skillPackageId).skills,
                skill.name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill">{skill.name}</PageTitle>    
            </PageHeader>

            <Boundary>
                <AdminModule_SkillDetails organization={organization} skillId={skill.skillId} skillPackageId={skill.skillPackageId}/>
            </Boundary>
            
        </AppPageContent>
        
    </AppPage>
}