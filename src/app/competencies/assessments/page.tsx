

import { SquarePenIcon } from 'lucide-react'

import { createId } from '@paralleldrive/cuid2'

import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { formatDateTime } from '@/lib/utils'
import * as Paths from '@/paths'
import { Link } from '@/components/ui/link'


export default async function AssessmentsListPage() {
    return <AppPage 
        label="Assessments" 
        breadcrumbs={[{ label: "Competencies", href: Paths.competencies }]}
        >
            <PageHeader>
                <PageTitle>Competency Assessments</PageTitle>
                <PageDescription>Your competency assessments (as assesor).</PageDescription>
                <PageControls>
                    <Button asChild>
                        <Link href={`/competencies/assessments/new`}>
                            <SquarePenIcon/> New Assessment
                        </Link>
                    </Button>
                </PageControls>
            </PageHeader>
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell className="text-center">Assessment Number</TableHeadCell>
                        <TableHeadCell>Date</TableHeadCell>
                        <TableHeadCell className="text-center">Assessee Count</TableHeadCell>
                        <TableHeadCell className="text-center">Skill Count</TableHeadCell>
                        <TableHeadCell className="text-center">Status</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell className="text-center">1</TableCell>
                        <TableCell>{formatDateTime(new Date())}</TableCell>
                        <TableCell className="text-center">5</TableCell>
                        <TableCell className="text-center">4</TableCell>
                        <TableCell className="text-center">Draft</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </AppPage>
}