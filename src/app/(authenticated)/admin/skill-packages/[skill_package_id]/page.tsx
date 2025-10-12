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

import { System_SkillPackage_Details_Card } from './skill-package-details'
import { SkillPackage_GroupsList } from './skill-package-groups-list'
import { SkillPackage_SkillsList } from './skill-package-skills-list'


export async function generateMetadata(props: PageProps<'/admin/skill-packages/[skill_package_id]'>) {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `${skillPackage.name} - Skill Packages` }
}

export default async function System_SkillPackage_Page(props: PageProps<'/admin/skill-packages/[skill_package_id]'>) {
    const { skillPackageId, name } = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin, 
                Paths.admin.skillPackages,
                name
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Package">{name}</PageTitle>    
            </PageHeader>
            <Boundary>
                <System_SkillPackage_Details_Card skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <SkillPackage_GroupsList skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <SkillPackage_SkillsList skillPackageId={skillPackageId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}