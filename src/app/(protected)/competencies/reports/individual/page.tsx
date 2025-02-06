/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/reports/individual
 */

import { format} from 'date-fns'
import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'


import IndividualReport from './individual-report'


export default function IndividualReportPage() {

    return <AppPage 
        label="Individual"
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard },
            { label: "Reports", href: Paths.competencies.reportsList }
        ]}
    >
        <PageHeader>
            <PageTitle>Individual Report</PageTitle>
            <PageDescription>{`Competency report for member 'John Smith'. Generated ${format(new Date(), 'PPP')}`}</PageDescription>
        </PageHeader>
        
        <IndividualReport/>
    </AppPage>
}