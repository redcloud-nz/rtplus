/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /teams/[team_slug]/competencies/skill-check-sessions/--create
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { SkillsModule_NewSession_Form } from './new-session'

export const metadata = { title: `New Skill Check Session` }

export default async function SkillsModule_NewSession_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.sessions,
                Paths.skillsModule.sessions.create,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>New Skill Check Session</PageTitle>
            </PageHeader>

            <Boundary>
                <SkillsModule_NewSession_Form/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}