/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/skill-packages/--create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { NewSkillPackageDetailsCard } from './new-skill-package'


export const metadata: Metadata = {
    title: 'Create Skill Package'
}

export default async function CreateSkillPackagePage() { 
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin,
                Paths.admin.skillPackages,
                Paths.admin.skillPackages.create
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