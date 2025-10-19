/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /skills/sessions
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { SkillModule_SkillCheckSessionsList } from './sessions-list'


export const metadata = { title: `Skill Check Sessions` }


export default async function SkillsModule_SkillCheckSessions_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.sessions,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skill Check Sessions</PageTitle>
            </PageHeader>
            <Boundary>
                <SkillModule_SkillCheckSessionsList/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}