/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /app/system/skill-packages/[skill_package_id]/skills/create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'

import { fetchSkillPackage } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'

import { NewSkillDetailsCard } from './new-skill-details'
import { Boundary } from '@/components/boundary'


export async function generateMetadata(props: { params: Promise<{ skill_package_id: string }> }): Promise<Metadata> {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function NewSkillPage(props: { params: Promise<{ skill_package_id: string }>}) {
    const skillPackage = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.skillPackages,
                { label: skillPackage.name, href: Paths.system.skillPackage(skillPackage.skillPackageId).href },
                "Skills",
                "Create"
            ]}
        />
        <HydrateClient>
            <AppPageContent variant='container'>
                <PageHeader>
                    <PageTitle>New Skill</PageTitle>
                    <PageDescription>Create a new skill within this skill package.</PageDescription>
                </PageHeader>
                
                <Boundary>
                      <NewSkillDetailsCard skillPackageId={skillPackage.skillPackageId} />
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
