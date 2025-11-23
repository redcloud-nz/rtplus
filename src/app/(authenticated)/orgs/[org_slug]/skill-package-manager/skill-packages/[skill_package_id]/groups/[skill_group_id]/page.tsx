/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /org/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/groups/[skill_group_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillGroup } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { AdminModule_SkillGroupDetails } from './skill-group-details'
import { AdminModule_SkillGroup_SkillsList } from './skill-group-skills-list'




export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/groups/[skill_group_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId, skill_group_id: skillGroupId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skillGroup = await fetchSkillGroup({ orgId: organization.orgId, skillGroupId, skillPackageId })
    return { title: `${skillGroup.name} - Skill Groups` }
}

export default async function AdminModule_SkillGroup_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/groups/[skill_group_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId, skill_group_id: skillGroupId } = await props.params
   const organization = await getOrganization(orgSlug)
    const skillGroup = await fetchSkillGroup({ orgId: organization.orgId, skillGroupId, skillPackageId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).skillPackageManager, 
                Paths.org(orgSlug).skillPackageManager.skillPackages,
                { label: skillGroup.skillPackage.name, href: Paths.org(orgSlug).skillPackageManager.skillPackage(skillPackageId).href },
                Paths.org(orgSlug).skillPackageManager.skillPackage(skillPackageId).groups,
                skillGroup.name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Group">{skillGroup.name}</PageTitle>    
            </PageHeader>

            <Boundary>
                    <AdminModule_SkillGroupDetails organization={organization} skillGroupId={skillGroupId} skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <AdminModule_SkillGroup_SkillsList organization={organization} skillGroupId={skillGroupId} skillPackageId={skillPackageId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}