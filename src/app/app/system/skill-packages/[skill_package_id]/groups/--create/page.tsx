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
import { HydrateClient } from '@/trpc/server'

import { getSkillPackage, SkillPackageParams } from '../..'

import { NewSkillGroupDetailsCard } from './new-skill-group-details'


export async function generateMetadata(props: { params: Promise<SkillPackageParams> }): Promise<Metadata> {
    const skillPackage = await getSkillPackage(props.params)
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function NewSkillGroupPage(props: { params: Promise<SkillPackageParams>}) {
    const skillPackage = await getSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system.index,
                Paths.system.skillPackages.index,
                { label: skillPackage.name, href: Paths.system.skillPackage(skillPackage.id).index },
                "Groups",
                "Create"
            ]}
        />
        <HydrateClient>
            <AppPageContent>
                <PageHeader>
                    <PageTitle>New Skill Group</PageTitle>
                    <PageDescription>Create a new skill group within this skill package.</PageDescription>
                </PageHeader>
                
                <Boundary>
                    <NewSkillGroupDetailsCard skillPackageId={skillPackage.id} />
                </Boundary>
                
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
