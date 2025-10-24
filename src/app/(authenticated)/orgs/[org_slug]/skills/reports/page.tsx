/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_id]/reports
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { TextLink } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'



export default async function Team_Skills_Reports_Index_Page(props: PageProps<'/orgs/[org_slug]/skills/reports'>) {
    const { org_slug: orgSlug } = await props.params
    //const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).skills,
                Paths.org(orgSlug).skills.reports
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
                            <TextLink to={Paths.org(orgSlug).skills.reports.individual}/>
                        </TableCell>
                        <TableCell>A report of an individuals competencies.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <TextLink to={Paths.org(orgSlug).skills.reports.teamSkills}/>
                        </TableCell>
                        <TableCell>A report of the teams competencies as the percentage of members currently competent.</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </AppPageContent>
    </AppPage>
}