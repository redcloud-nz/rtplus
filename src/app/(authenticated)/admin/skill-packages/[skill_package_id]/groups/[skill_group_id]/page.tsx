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

import { SkillGroup_Details_Card } from './skill-group-details'
import { SkillGroup_SkillsList_Card } from './skill-group-skills-list'



export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]/groups/[skill_group_id]'>) {
    const skillGroup = await fetchSkillGroup(props.params)
    return { title: `${skillGroup.name} - Skill Groups` }
}

export default async function SkillGroup_Page(props: PageProps<'/admin/skill-packages/[skill_package_id]/groups/[skill_group_id]'>) {
    const { skillGroupId, skillPackageId, skillPackage, name} = await fetchSkillGroup(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin, 
                Paths.admin.skillPackages,
                { label: skillPackage.name, href: Paths.admin.skillPackage(skillPackageId).href },
                Paths.admin.skillPackage(skillPackageId).groups,
                name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Group">{name}</PageTitle>    
            </PageHeader>

            <Boundary>
                    <SkillGroup_Details_Card skillGroupId={skillGroupId} skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <SkillGroup_SkillsList_Card skillGroupId={skillGroupId} skillPackageId={skillPackageId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}