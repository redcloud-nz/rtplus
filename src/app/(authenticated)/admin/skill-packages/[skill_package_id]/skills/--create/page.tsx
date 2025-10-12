/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /admin/skill-packages/[skill_package_id]/skills/create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'

import { fetchSkillPackage } from '@/server/fetch'

import { NewSkillDetailsCard } from './new-skill'
import { Boundary } from '@/components/boundary'


export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>): Promise<Metadata> {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function NewSkillPage(props: PageProps<'/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const skillPackage = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin,
                Paths.admin.skillPackages,
                { label: skillPackage.name, href: Paths.admin.skillPackage(skillPackage.skillPackageId).href },
                Paths.admin.skillPackage(skillPackage.skillPackageId).skills,
                Paths.admin.skillPackage(skillPackage.skillPackageId).skills.create
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle>New Skill</PageTitle>
                <PageDescription>Create a new skill within this skill package.</PageDescription>
            </PageHeader>
            
            <Boundary>
                    <NewSkillDetailsCard skillPackageId={skillPackage.skillPackageId} />
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}
