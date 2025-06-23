/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill_package_id]/groups/[skill_group_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { SkillGroupDetailsCard_sys } from './skill-group-details'
import { getSkillGroup, SkillGroupParams } from '.'


export async function generateMetadata(props: { params: Promise<SkillGroupParams> }) {
    const skillGroup = await getSkillGroup(props.params)
    return { title: `${skillGroup.name} - Skill Groups` }
    
}

export default async function SkillGroupPage(props: { params: Promise<SkillGroupParams> }) {
    const skillGroup = await getSkillGroup(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
                { label: skillGroup.skillPackage.name, href: Paths.system.skillPackages.skillPackage(skillGroup.skillPackageId).index },
                Paths.system.skillPackages.skillPackage(skillGroup.skillPackageId).groups,
                skillGroup.name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Group">{skillGroup.name}</PageTitle>    
            </PageHeader>

            <SkillGroupDetailsCard_sys skillGroupId={skillGroup.id} skillPackageId={skillGroup.skillPackageId}/>
        </AppPageContent>
    </AppPage>
}