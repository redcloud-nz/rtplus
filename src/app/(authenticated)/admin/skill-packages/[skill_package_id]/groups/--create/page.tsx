/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /admin/skill-packages/[skill_package_id]/groups/--create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillPackage } from '@/server/fetch'

import { NewSkillGroupDetailsCard } from './new-skill-group'



export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]/groups/--create'>): Promise<Metadata> {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function NewSkillGroupPage(props: PageProps<'/admin/skill-packages/[skill_package_id]/groups/--create'>) {
    const { skillPackageId, name } = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin,
                Paths.admin.skillPackages,
                { label: name, href: Paths.admin.skillPackage(skillPackageId).href },
                Paths.admin.skillPackage(skillPackageId).groups,
                Paths.admin.skillPackage(skillPackageId).groups.create
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle>New Skill Group</PageTitle>
                <PageDescription>Create a new skill group within this skill package.</PageDescription>
            </PageHeader>
            
            <Boundary>
                <NewSkillGroupDetailsCard skillPackageId={skillPackageId} />
            </Boundary>
            
        </AppPageContent>
    </AppPage>
}
