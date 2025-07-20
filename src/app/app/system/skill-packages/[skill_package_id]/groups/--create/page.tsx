/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /app/system/skill-packages/[skill_package_id]/groups/create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillPackage } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'

import { NewSkillGroupDetailsCard } from './new-skill-group-details'



export async function generateMetadata(props: { params: Promise<{ skill_package_id: string }> }): Promise<Metadata> {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function NewSkillGroupPage(props: { params: Promise<{ skill_package_id: string }>}) {
    const skillPackage = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.skillPackages,
                { label: skillPackage.name, href: Paths.system.skillPackage(skillPackage.skillPackageId).index },
                "Groups",
                "Create"
            ]}
        />
        <HydrateClient>
            <AppPageContent variant='container'>
                <PageHeader>
                    <PageTitle>New Skill Group</PageTitle>
                    <PageDescription>Create a new skill group within this skill package.</PageDescription>
                </PageHeader>
                
                <Boundary>
                    <NewSkillGroupDetailsCard skillPackageId={skillPackage.skillPackageId} />
                </Boundary>
                
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
