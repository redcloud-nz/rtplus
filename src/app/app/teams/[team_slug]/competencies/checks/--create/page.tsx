/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team-slug]/competencies/checks/--create
 */

import * as React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'


import * as Paths from '@/paths'
import { RecordSkillCheckCard } from './record-skill-check-card'
import { fetchTeamBySlug } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'
import { Boundary } from '@/components/boundary'



export default async function RecordSkillCheckPage({ params }: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(params)

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.team(team),
                Paths.team(team).competencies,
                "Single Check"
            ]}
        />
        
        <HydrateClient>
            <AppPageContent variant="container">
                <Boundary>
                    <RecordSkillCheckCard/> 
                </Boundary>
                
            </AppPageContent>
        </HydrateClient>
        
        
    </AppPage>
}


