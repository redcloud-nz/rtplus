import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'


export default async function ReportCompetenciesPage() {
    return <AppPage label="Reports" breadcrumbs={[{ label: "Competencies", href: Paths.competencies.dashboard}]}>
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
                        <Link href={Paths.competencies.reports.individual}>Individual</Link>
                    </TableCell>
                    <TableCell>A report of an individuals competencies.</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Link href={Paths.competencies.reports.individual}>Team Skills</Link>
                    </TableCell>
                    <TableCell>A report of the teams skills as the percentage of members currently competent.</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </AppPage>
}