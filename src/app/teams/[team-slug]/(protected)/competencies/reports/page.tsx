/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/reports
 */


import { TeamParams } from '@/app/teams/[team-slug]'
import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'



export default async function ReportCompetenciesPage(props: { params: Promise<TeamParams>}) {
    const { 'team-slug': teamSlug } = await props.params
    const competenciesPath = Paths.team(teamSlug).competencies

    return <AppPage label="Reports" breadcrumbs={[{ label: "Competencies", href: competenciesPath.dashboard}]}>
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
                        <Link href={competenciesPath.reports.individual}>Individual</Link>
                    </TableCell>
                    <TableCell>A report of an individuals competencies.</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Link href={competenciesPath.reports.teamSkills}>Team Skills</Link>
                    </TableCell>
                    <TableCell>A report of the teams skills as the percentage of members currently competent.</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </AppPage>
}