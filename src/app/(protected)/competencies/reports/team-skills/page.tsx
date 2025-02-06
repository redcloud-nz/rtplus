/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/reports/team-skills
 */

import { format } from 'date-fns'
import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import TeamSkillsReport from './team-skills-report'


export default function TeamSkillsReportPage() {

    return <AppPage 
        label="Team Skills"
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard },
            { label: "Reports", href: Paths.competencies.reportsList }
        ]}
    >
        <PageHeader>
            <PageTitle>Team Skills Report</PageTitle>
            <PageDescription>{`Skills report for Team NZ-RT13. Generated ${format(new Date(), 'PPP')}`}</PageDescription>
        </PageHeader>
        <TeamSkillsReport/>
    </AppPage>
}