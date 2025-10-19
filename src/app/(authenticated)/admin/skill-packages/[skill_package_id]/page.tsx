/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/skill-packages/[skill_package_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillPackage } from '@/server/fetch'

import { AdminModule_SkillPackage_Details } from './skill-package-details'
import { AdminModule_SkillPackage_GroupsList } from './skill-package-groups-list'
import { AdminModule_SkillPackage_SkillsList } from './skill-package-skills-list'


export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]'>) {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `${skillPackage.name} - Skill Packages` }
}

export default async function AdminModule_SkillPackage_Page(props: PageProps<'/admin/skill-packages/[skill_package_id]'>) {
    const { skillPackageId, name } = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule, 
                Paths.adminModule.skillPackages,
                name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Package">{name}</PageTitle>    
            </PageHeader>
            <Boundary>
                <AdminModule_SkillPackage_Details skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <AdminModule_SkillPackage_GroupsList skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <AdminModule_SkillPackage_SkillsList skillPackageId={skillPackageId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}