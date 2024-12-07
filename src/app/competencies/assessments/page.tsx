'use client'

import { formatISO } from 'date-fns'
import { SquarePenIcon } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'

import { AssessmentStore } from './assessment-context'
import Alert from '@/components/ui/alert'


export default function AssessmentsListPage() {

    const assessmentsQuery = useQuery({
        queryKey: ['assessments'],
        queryFn: () => AssessmentStore.getAll()
    })

    return <AppPage 
        label="Assessments" 
        breadcrumbs={[{ label: "Competencies", href: Paths.competencies.dashboard }]}
        >
            <PageHeader>
                <PageTitle>Competency Assessments</PageTitle>
                <PageDescription>Your competency assessments (as assesor).</PageDescription>
                <PageControls>
                    <Button asChild>
                        <Link href={Paths.competencies.newAssessment}>
                            <SquarePenIcon/> New <span className="hidden md:inline">Assessment</span>
                        </Link>
                    </Button>
                </PageControls>
            </PageHeader>
            { assessmentsQuery.isPending && <Skeleton className="h-8"/>}
            { assessmentsQuery.isSuccess && <Show
                when={assessmentsQuery.data.length > 0}
                fallback={<Alert severity="info" title="No previous assessments">Add one to get started.</Alert>}
            >
                <Table border>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Date</TableHeadCell>
                            <TableHeadCell className="w-32 hidden md:table-cell text-center">Skill Count</TableHeadCell>
                            <TableHeadCell className="w-32 hidden md:table-cell text-center">Assessee Count</TableHeadCell>
                            <TableHeadCell className="w-32 hidden md:table-cell text-center">Check Count</TableHeadCell>
                            <TableHeadCell className="text-center">Status</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assessmentsQuery.data.map(assessment => 
                            <TableRow key={assessment.id}>
                                <TableCell><Link href={Paths.competencies.assessment(assessment.id).edit}>{assessment.name}</Link></TableCell>
                                <TableCell>{formatISO(assessment.date, { representation: 'date' })}</TableCell>
                                <TableCell className="hidden md:table-cell text-center ">{assessment.skillIds.length}</TableCell>
                                <TableCell className="hidden md:table-cell text-center">{assessment.assesseeIds.length}</TableCell>
                                <TableCell className="hidden md:table-cell text-center">{assessment.skillChecks.length}</TableCell>
                                <TableCell className="text-center">{assessment.status}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Show>
        }
    </AppPage>
}