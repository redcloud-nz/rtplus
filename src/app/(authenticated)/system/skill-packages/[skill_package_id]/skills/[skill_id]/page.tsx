/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill_package_id]/skills/[skill_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchSkill } from '@/server/fetch'

import { SkillDetailsCard } from './skill-details'




export async function generateMetadata(props: { params: Promise<{ skill_id: string, skill_package_id: string }> }) {
    const skill = await fetchSkill(props.params)
    return { title: `${skill.name} - Skills` }
}
export default async function SkillPage(props: { params: Promise<{ skill_id: string, skill_package_id: string}> }) {
    const skill = await fetchSkill(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
                { label: skill.skillPackage.name, href: Paths.system.skillPackage(skill.skillPackageId).href },
                Paths.system.skillPackage(skill.skillPackageId).skills,
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