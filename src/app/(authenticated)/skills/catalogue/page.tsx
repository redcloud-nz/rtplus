/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/skills
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { SkillsModule_SkillPackages_List } from './team-skill-package-list'

export const metadata = { title: 'Skills' }


export default async function SkillsModule_Catalogue_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.catalogue
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <SkillsModule_SkillPackages_List/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}