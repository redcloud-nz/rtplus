/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team-slug]/competencies/record
 */

import * as React from 'react'

import { TeamParams } from '@/app/teams/[team-slug]'
import { AppPage, PageHeader, PageTitle } from '@/components/app-page'


import * as Paths from '@/paths'
import { RecordSkillCheckForm } from './record-skill-check-form'



export default async function RecordSkillCheckPage({ params }: { params: Promise<TeamParams>}) {
    const { 'team-slug': teamSlug } = await params

    const competenciesPath = Paths.team(teamSlug).competencies

    return <AppPage
        label="Single Check"
        breadcrumbs={[{ label: 'Competencies', href: competenciesPath.dashboard }]}
    >
        <PageHeader>
            <PageTitle>Record Skill Check</PageTitle>
        </PageHeader>
        <RecordSkillCheckForm cancelHref={competenciesPath.dashboard}/>
    </AppPage>
}


