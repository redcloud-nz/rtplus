/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages/[skill-package-id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { SkillPackageDetailsCard_sys } from './skill-package-details'
import { SkillPackageGroupsListCard_sys } from './skill-package-groups-list'

import { getSkillPackage, SkillPackageParams } from '.'
import { SkillPackageSkillsListCard_sys } from './skill-package-skills-list'


export async function generateMetadata(props: { params: Promise<SkillPackageParams> }) {
    const skillPackage = await getSkillPackage(props.params)
    return { title: `${skillPackage.name} - Skill Packages` }
}

export default async function SkillPackagePage(props: { params: Promise<SkillPackageParams>}) {
    const skillPackage = await getSkillPackage(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            label={skillPackage.name} 
            breadcrumbs={[
                { label: "System", href: Paths.system.index }, 
                { label: "Skill Packages", href: Paths.system.skillPackages.index }
            ]}
        />
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle objectType="Skill Package">{skillPackage.name}</PageTitle>
                
            </PageHeader>

            <SkillPackageDetailsCard_sys skillPackageId={skillPackage.id}/>
            <SkillPackageGroupsListCard_sys skillPackageId={skillPackage.id}/>
            <SkillPackageSkillsListCard_sys skillPackageId={skillPackage.id}/>
        </AppPageContent>
    </AppPage>
}