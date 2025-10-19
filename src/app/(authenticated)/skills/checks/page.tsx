/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/skill-checks
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { SkillsModule_SkillChecks_List } from './skill-checks-list'

export const metadata = {
    title: "Skill Checks",
}

export default async function SkillModule_SkillChecks_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.checks
            ]}
        />
        
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skill Checks</PageTitle>
            </PageHeader>

            <Boundary>
                <SkillsModule_SkillChecks_List/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}