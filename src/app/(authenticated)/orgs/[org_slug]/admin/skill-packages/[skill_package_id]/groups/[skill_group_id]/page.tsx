/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/skill-packages/[skill_package_id]/groups/[skill_group_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillGroup } from '@/server/fetch'

import { AdminModule_SkillGroupDetails } from './skill-group-details'
import { AdminModule_SkillGroup_SkillsList } from './skill-group-skills-list'



export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]/groups/[skill_group_id]'>) {
    const skillGroup = await fetchSkillGroup(props.params)
    return { title: `${skillGroup.name} - Skill Groups` }
}

export default async function AdminModule_SkillGroup_Page(props: PageProps<'/admin/skill-packages/[skill_package_id]/groups/[skill_group_id]'>) {
    const { skillGroupId, skillPackageId, skillPackage, name} = await fetchSkillGroup(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule, 
                Paths.adminModule.skillPackages,
                { label: skillPackage.name, href: Paths.adminModule.skillPackage(skillPackageId).href },
                Paths.adminModule.skillPackage(skillPackageId).groups,
                name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Group">{name}</PageTitle>    
            </PageHeader>

            <Boundary>
                    <AdminModule_SkillGroupDetails skillGroupId={skillGroupId} skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <AdminModule_SkillGroup_SkillsList skillGroupId={skillGroupId} skillPackageId={skillPackageId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}