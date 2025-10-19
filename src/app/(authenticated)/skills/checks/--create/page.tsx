/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /skills/checks/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { SkillsModule_NewCheck_Form } from './team-new-check'


export const metadata = { title: 'Create Skill Check' }

export default async function SkillsModule_NewCheck_Page() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.checks,
                Paths.skillsModule.checks.create,
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <SkillsModule_NewCheck_Form/> 
            </Boundary>
        </AppPageContent>
    </AppPage>
}


