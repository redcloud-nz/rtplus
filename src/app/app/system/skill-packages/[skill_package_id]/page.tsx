/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill_package_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillPackage } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { SkillPackageDetailsCard } from './skill-package-details'
import { SkillPackageGroupsListCard } from './skill-package-groups-list'
import { SkillPackageSkillsListCard } from './skill-package-skills-list'


export async function generateMetadata(props: { params: Promise<{ skill_package_id: string}> }) {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `${skillPackage.name} - Skill Packages` }
}

export default async function SkillPackagePage(props: { params: Promise<{ skill_package_id: string }>}) {
    const skillPackage = await fetchSkillPackage(props.params)

    prefetch(trpc.skillGroups.bySkillPackageId.queryOptions({ skillPackageId: skillPackage.id }))
    prefetch(trpc.skills.bySkillPackageId.queryOptions({ skillPackageId: skillPackage.id }))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
                skillPackage.name
            ]}
        />
        <HydrateClient>
            <AppPageContent variant='container'>
                <PageHeader>
                    <PageTitle objectType="Skill Package">{skillPackage.name}</PageTitle>    
                </PageHeader>
                <Boundary>
                    <SkillPackageDetailsCard skillPackageId={skillPackage.id}/>
                </Boundary>
                <Boundary>
                    <SkillPackageGroupsListCard skillPackageId={skillPackage.id}/>
                </Boundary>
                <Boundary>
                    <SkillPackageSkillsListCard skillPackageId={skillPackage.id}/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}