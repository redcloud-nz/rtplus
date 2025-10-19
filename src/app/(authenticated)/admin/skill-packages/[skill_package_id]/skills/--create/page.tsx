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

import { AdminModule_NewSkill_Form } from './new-skill'
import { Boundary } from '@/components/boundary'


export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>): Promise<Metadata> {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `New Skill | ${skillPackage.name}` }
}

export default async function AdminModule_NewSkill_Page(props: PageProps<'/admin/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const skillPackage = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule,
                Paths.adminModule.skillPackages,
                { label: skillPackage.name, href: Paths.adminModule.skillPackage(skillPackage.skillPackageId).href },
                Paths.adminModule.skillPackage(skillPackage.skillPackageId).skills,
                Paths.adminModule.skillPackage(skillPackage.skillPackageId).skills.create
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle>New Skill</PageTitle>
                <PageDescription>Create a new skill within this skill package.</PageDescription>
            </PageHeader>
            
            <Boundary>
                    <AdminModule_NewSkill_Form skillPackageId={skillPackage.skillPackageId} />
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}
