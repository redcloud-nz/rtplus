/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skil-groups/[skill-group-id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { SkillGroupDetailsCard_sys } from './skill-group-details'

import { getSkillGroup, SkillGroupParams } from '.'
import { SkillGroupSkillsListCard_sys } from './skill-group-skills-list'


export async function generateMetadata(props: { params: Promise<SkillGroupParams> }) {
    const skillGroup = await getSkillGroup(props.params)

    return { title: `${skillGroup.name} - Skill Groups` }
}

export default async function SkillGroupPage(props: { params: Promise<SkillGroupParams>}) {
    const skillGroup = await getSkillGroup(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            label={skillGroup.name} 
            breadcrumbs={[
                { label: "System", href: Paths.system.index }, 
                { label: "Skill Groups", href: Paths.system.skillGroups.index }
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Group">{skillGroup.name}</PageTitle>
                
            </PageHeader>
            <SkillGroupDetailsCard_sys skillGroupId={skillGroup.id}/>
            <SkillGroupSkillsListCard_sys skillGroupId={skillGroup.id}/>
        </AppPageContent>
        
    </AppPage>
}