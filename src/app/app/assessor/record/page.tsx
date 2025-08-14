/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/assessor/record
 */

import * as React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { RequireActiveTeam } from '@/components/nav/require-active-team'

import * as Paths from '@/paths'

import { HydrateClient } from '@/trpc/server'

import { RecordSkillCheck_Card } from './record-skill-check'


export default async function Record_SkillCheck_Page() {
   

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.assessor,
                Paths.assessor.record
            ]}
        />
        
        <HydrateClient>
            <AppPageContent variant="container">
                <Boundary>
                    <RequireActiveTeam>
                        <RecordSkillCheck_Card/> 
                    </RequireActiveTeam>
                </Boundary>
                
            </AppPageContent>
        </HydrateClient>
        
        
    </AppPage>
}


