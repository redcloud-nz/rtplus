/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments
 */

import { formatISO } from 'date-fns'
import { SquarePenIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

import { auth } from '@clerk/nextjs/server'

import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import { assertNonNull } from '@/lib/utils'

import * as Paths from '@/paths'
import { FormState } from '@/lib/form-state'
import { Form, FormSubmitButton } from '@/components/ui/form'


export default async function AssessmentsListPage() {

    const { orgId, userId } = await auth.protect()

    const assessments = await prisma.competencyAssessment.findMany({
        where: { orgId, userId },
        include: {
            _count: {
                select: { skills: true, assessees: true, checks: true }
            }
        }
    })

    return <AppPage 
        label="Assessments" 
        breadcrumbs={[{ label: "Competencies", href: Paths.competencies.dashboard }]}
    >
        <PageHeader>
            <PageTitle>Competency Assessments</PageTitle>
            <PageDescription>Your competency assessments (as assesor).</PageDescription>
            <PageControls>
                <Form action={createAssessmentAction}>
                    <FormSubmitButton
                        label={<><SquarePenIcon/> New <span className="hidden md:inline">Assessment</span></>}
                        loading="Creating"
                    />
                </Form>
            </PageControls>
        </PageHeader>
       <Show
            when={assessments.length > 0}
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
                    {assessments.map((assessment, index) => 
                        <TableRow key={assessment.id}>
                            <TableCell><Link href={Paths.competencies.assessment(assessment.id).edit}>{assessment.name || `#${index+1}`}</Link></TableCell>
                            <TableCell>{formatISO(assessment.date, { representation: 'date' })}</TableCell>
                            <TableCell className="hidden md:table-cell text-center ">{assessment._count.skills}</TableCell>
                            <TableCell className="hidden md:table-cell text-center">{assessment._count.assessees}</TableCell>
                            <TableCell className="hidden md:table-cell text-center">{assessment._count.checks}</TableCell>
                            <TableCell className="text-center">{assessment.status}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>
}

async function createAssessmentAction(): Promise<FormState> {
    'use server'

    const { userId, orgId } = await auth.protect()
    assertNonNull(orgId, "An active organization is required to execute 'createAssessmentAction'")

    const year = new Date().getFullYear()

    const assessments = await prisma.competencyAssessment.findMany({
        select: { id: true, name: true },
        where: { orgId, userId, name: { startsWith: `${year} #`} },
    })

    let highestNum = 0
    for(const assessment of assessments) {
        const num = parseInt(assessment.name.slice(6))
        if(!isNaN(num) && num > highestNum) {
            highestNum = num
        }
    }

    const createdAssessment = await prisma.competencyAssessment.create({
        data: {
            userId, orgId,
            date: new Date(),
            name: `${year} #${highestNum+1}`,
            location: ''
        }
    })

    redirect(Paths.competencies.assessment(createdAssessment.id).edit)
}