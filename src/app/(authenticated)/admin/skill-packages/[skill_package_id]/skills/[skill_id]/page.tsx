/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/skill-packages/[skill_package_id]/skills/[skill_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchSkill } from '@/server/fetch'

import { SkillDetailsCard } from './skill-details'


export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const skill = await fetchSkill(props.params)
    return { title: `${skill.name} - Skills` }
}

export default async function SkillPage(props: PageProps<'/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const skill = await fetchSkill(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin,
                Paths.admin.skillPackages,
                { label: skill.skillPackage.name, href: Paths.admin.skillPackage(skill.skillPackageId).href },
                Paths.admin.skillPackage(skill.skillPackageId).skills,
                skill.name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill">{skill.name}</PageTitle>    
            </PageHeader>

            <Boundary>
                <SkillDetailsCard skillId={skill.skillId} skillPackageId={skill.skillPackageId}/>
            </Boundary>
            
        </AppPageContent>
        
    </AppPage>
}