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

import { AdminModule_NewSkillGroup_Form } from './new-skill-group'



export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]/groups/--create'>): Promise<Metadata> {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function AdminModuleNewSkillGroup_Page(props: PageProps<'/admin/skill-packages/[skill_package_id]/groups/--create'>) {
    const { skillPackageId, name } = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule,
                Paths.adminModule.skillPackages,
                { label: name, href: Paths.adminModule.skillPackage(skillPackageId).href },
                Paths.adminModule.skillPackage(skillPackageId).groups,
                Paths.adminModule.skillPackage(skillPackageId).groups.create
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle>New Skill Group</PageTitle>
                <PageDescription>Create a new skill group within this skill package.</PageDescription>
            </PageHeader>
            
            <Boundary>
                <AdminModule_NewSkillGroup_Form skillPackageId={skillPackageId} />
            </Boundary>
            
        </AppPageContent>
    </AppPage>
}
