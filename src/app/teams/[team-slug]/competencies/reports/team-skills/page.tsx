/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/reports/team-skills
 */

import { format } from 'date-fns'
import React from 'react'

import { TeamParams } from '@/app/teams/[team-slug]'
import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import TeamSkillsReport from './team-skills-report'


export default async function TeamSkillsReportPage(props: { params: Promise<TeamParams>}) {

    const { 'team-slug': teamSlug } = await props.params
    const competenciesPath = Paths.team(teamSlug).competencies

    return <AppPage>
        <AppPageBreadcrumbs
            label="Team Skills"
            breadcrumbs={[
                { label: "Competencies", href: competenciesPath.overview },
                { label: "Reports", href: competenciesPath.reportsList }
            ]}
        />
        <AppPageContent>
            <PageHeader>
                <PageTitle>Team Skills Report</PageTitle>
                <PageDescription>{`Skills report for Team NZ-RT13. Generated ${format(new Date(), 'PPP')}`}</PageDescription>
            </PageHeader>
            <TeamSkillsReport/>
        </AppPageContent>
        
    </AppPage>
}