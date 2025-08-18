/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/reports
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { fetchTeam } from '@/server/fetch'



export default async function Team_Competencies_Reports_Index_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeam(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team), 
                Paths.team(team).competencies, 
                Paths.team(team).competencies.reports
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
                            <Link to={Paths.team(team).competencies.reports.individual}>Individual</Link>
                        </TableCell>
                        <TableCell>A report of an individuals competencies.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Link to={Paths.team(team).competencies.reports.teamSkills}>Team Skills</Link>
                        </TableCell>
                        <TableCell>A report of the teams skills as the percentage of members currently competent.</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </AppPageContent>
    </AppPage>
}