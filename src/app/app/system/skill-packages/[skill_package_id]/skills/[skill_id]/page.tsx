/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill_package_id]/skills/[skill_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { SkillDetailsCard_sys } from './skill-details'
import { getSkill, SkillParams } from '.'


export async function generateMetadata(props: { params: Promise<SkillParams> }) {
    const skill = await getSkill(props.params)
    return { title: `${skill.name} - Skills` }
}
export default async function SkillPage(props: { params: Promise<SkillParams> }) {
    const skill = await getSkill(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
                { label: skill.skillPackage.name, href: Paths.system.skillPackages(skill.skillPackageId).index },
                Paths.system.skillPackages(skill.skillPackageId).skills,
                skill.name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill">{skill.name}</PageTitle>    
            </PageHeader>

            <SkillDetailsCard_sys skillId={skill.id} skillPackageId={skill.skillPackageId}/>
        </AppPageContent>
    </AppPage>
}