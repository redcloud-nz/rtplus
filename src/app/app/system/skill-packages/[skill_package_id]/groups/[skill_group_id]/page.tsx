/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/skill-packages/[skill_package_id]/groups/[skill_group_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillGroup } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { SkillGroupDetailsCard } from './skill-group-details'
import { SkillGroupSkillsListCard } from './skill-group-skills-list'



export async function generateMetadata(props: { params: Promise<{ skill_group_id: string, skill_package_id: string }> }) {
    const skillGroup = await fetchSkillGroup(props.params)
    return { title: `${skillGroup.name} - Skill Groups` }
}

export default async function SkillGroupPage(props: { params: Promise<{ skill_group_id: string, skill_package_id: string }> }) {
    const skillGroup = await fetchSkillGroup(props.params)

    prefetch(trpc.skills.bySkillGroupId.queryOptions({ skillGroupId: skillGroup.id }))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
                { label: skillGroup.skillPackage.name, href: Paths.system.skillPackage(skillGroup.skillPackageId).index },
                Paths.system.skillPackage(skillGroup.skillPackageId).groups,
                skillGroup.name
            ]}
        />
        <HydrateClient>
             <AppPageContent variant='container'>
                <PageHeader>
                    <PageTitle objectType="Skill Group">{skillGroup.name}</PageTitle>    
                </PageHeader>

                <Boundary>
                     <SkillGroupDetailsCard skillGroupId={skillGroup.id} skillPackageId={skillGroup.skillPackageId}/>
                </Boundary>
               <Boundary>
                    <SkillGroupSkillsListCard skillGroupId={skillGroup.id} skillPackageId={skillGroup.skillPackageId}/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
       
    </AppPage>
}