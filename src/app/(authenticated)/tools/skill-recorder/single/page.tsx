/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/single
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { RequireActiveTeam } from '@/components/nav/require-active-team'

import * as Paths from '@/paths'

import { CompetencyRecorder_Single_Card } from './record-skill-check'


export const metadata = { title: 'Single' }

export default async function CompetencyRecorder_Single_Page() {
   

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.tools.skillRecorder,
                Paths.tools.skillRecorder.single
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <RequireActiveTeam>
                    <CompetencyRecorder_Single_Card/> 
                </RequireActiveTeam>
            </Boundary>
            
        </AppPageContent>
    </AppPage>
}


