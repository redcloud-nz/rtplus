/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /skills
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'

import { SessionsCount_Card, SkillChecksCount_Card, SkillsCount_Card, PersonnelCount_Card } from './skill-stats'


export const metadata = { title: 'Skills Dashboard' }


export default async function SkillsModule_Index_Page() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.skillsModule
        ]}/>
        
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skills Dashboard</PageTitle>
            </PageHeader>
            <div className="grid grid-cols-2 md:grid-col-3 lg:grid-cols-4 gap-4">
                <Boundary>
                    <SkillsCount_Card/>
                </Boundary>
                <Boundary>
                    <PersonnelCount_Card/>
                </Boundary>
                <Boundary>
                    <SessionsCount_Card />
                </Boundary>
                <Boundary>
                    <SkillChecksCount_Card />
                </Boundary>
            </div>
            <Paragraph>
                Welcome to the RT+ Skills Module.
            </Paragraph>
        </AppPageContent>
    </AppPage>
}


