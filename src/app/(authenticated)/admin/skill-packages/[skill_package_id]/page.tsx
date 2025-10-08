/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill_package_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchSkillPackage } from '@/server/fetch'

import { System_SkillPackage_Details_Card } from './skill-package-details'
import { System_SkillPackage_GroupsList_Card } from './skill-package-groups-list'
import { System_SkillPackage_SkillsList_Card } from './skill-package-skills-list'


export async function generateMetadata(props: { params: Promise<{ skill_package_id: string}> }) {
    const skillPackage = await fetchSkillPackage(props.params)
    return { title: `${skillPackage.name} - Skill Packages` }
}

export default async function System_SkillPackage_Page(props: { params: Promise<{ skill_package_id: string }>}) {
    const {skillPackageId, name } = await fetchSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
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
                <System_SkillPackage_GroupsList_Card skillPackageId={skillPackageId}/>
            </Boundary>
            <Boundary>
                <System_SkillPackage_SkillsList_Card skillPackageId={skillPackageId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}