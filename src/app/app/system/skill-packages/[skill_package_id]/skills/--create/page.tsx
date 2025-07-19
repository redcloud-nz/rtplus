/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /app/system/skill-packages/[skill_package_id]/skills/create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'

import { getSkillPackage, SkillPackageParams } from '../..'

import { NewSkillDetailsCard } from './new-skill-details'
import { HydrateClient } from '@/trpc/server'


export async function generateMetadata(props: { params: Promise<SkillPackageParams> }): Promise<Metadata> {
    const skillPackage = await getSkillPackage(props.params)
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function NewSkillPage(props: { params: Promise<SkillPackageParams>}) {
    const skillPackage = await getSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.skillPackages,
                { label: skillPackage.name, href: Paths.system.skillPackage(skillPackage.id).index },
                "Skills",
                "Create"
            ]}
        />
        <HydrateClient>
            <AppPageContent>
                <PageHeader>
                    <PageTitle>New Skill</PageTitle>
                    <PageDescription>Create a new skill within this skill package.</PageDescription>
                </PageHeader>
                
                <NewSkillDetailsCard skillPackageId={skillPackage.id} />
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
