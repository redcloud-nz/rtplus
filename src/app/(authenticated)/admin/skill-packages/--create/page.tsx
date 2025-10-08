/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/skill-packages/--create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { NewSkillPackageDetailsCard } from './new-skill-package-details'


export const metadata: Metadata = {
    title: 'Create Skill Package'
}

export default async function CreateSkillPackagePage() { 
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
                "Create"
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create Skill Package</PageTitle>
            </PageHeader>

            <Boundary>
                <NewSkillPackageDetailsCard />
            </Boundary>
        </AppPageContent>
    </AppPage>
 }