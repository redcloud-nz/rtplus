/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /team/[team-slug]/competencies/reports/individual
 */

import { format} from 'date-fns'
import React from 'react'

import { TeamParams } from '@/app/manage/teams/[team_slug]'
import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import IndividualReport from './individual-report'



export default async function IndividualReportPage(props: { params: Promise<TeamParams>}) {

    const { 'team-slug': teamSlug } = await props.params
    const competenciesPath = Paths.team(teamSlug).competencies

    return <AppPage>
        <AppPageBreadcrumbs
            label="Individual"
            breadcrumbs={[
                { label: "Competencies", href: competenciesPath.overview },
                { label: "Reports", href: competenciesPath.reportsList }
            ]}
        />
        <AppPageContent>
            <PageHeader>
                <PageTitle>Individual Report</PageTitle>
                <PageDescription>{`Competency report for member 'John Smith'. Generated ${format(new Date(), 'PPP')}`}</PageDescription>
            </PageHeader>
            
            <IndividualReport/>
        </AppPageContent>
        
    </AppPage>
}