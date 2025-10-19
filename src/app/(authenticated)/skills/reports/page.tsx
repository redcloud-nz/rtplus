/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/reports
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { TextLink } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'



export default async function Team_Skills_Reports_Index_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule, 
                Paths.skillsModule.reports
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Competency Reports</PageTitle>
            </PageHeader>
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Report Name</TableHeadCell>
                        <TableHeadCell>Report Description</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <TextLink to={Paths.skillsModule.reports.individual}/>
                        </TableCell>
                        <TableCell>A report of an individuals competencies.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <TextLink to={Paths.skillsModule.reports.teamSkills}/>
                        </TableCell>
                        <TableCell>A report of the teams competencies as the percentage of members currently competent.</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </AppPageContent>
    </AppPage>
}