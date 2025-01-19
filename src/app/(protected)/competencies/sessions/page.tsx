/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments
 */

import { formatISO } from 'date-fns'
import { SquarePenIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

import { auth, currentUser } from '@clerk/nextjs/server'

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


export default async function SkillCheckSessionListPage() {

    const { userId } = await auth.protect()

    const assessments = await prisma.skillCheckSession.findMany({
        where: { userId },
        include: {
            _count: {
                select: { skills: true, assessees: true, checks: true }
            }
        }
    })

    return <AppPage 
        label="Assessment Sessions" 
        breadcrumbs={[{ label: "Competencies", href: Paths.competencies.dashboard }]}
    >
        <PageHeader>
            <PageTitle>Sessions</PageTitle>
            <PageDescription>Your competency assessments (as assesor).</PageDescription>
            <PageControls>
                <Form action={createSessionAction}>
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
                            <TableCell><Link href={Paths.competencies.session(assessment.id)}>{assessment.name || `#${index+1}`}</Link></TableCell>
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

async function createSessionAction(): Promise<FormState> {
    'use server'

    const { userId } = await auth.protect()
    const user = await currentUser()!
    assertNonNull(user)

    const year = new Date().getFullYear()

    const assessments = await prisma.skillCheckSession.findMany({
        select: { id: true, name: true },
        where: { userId, name: { startsWith: `${year} #`} },
    })

    let highestNum = 0
    for(const assessment of assessments) {
        const num = parseInt(assessment.name.slice(6))
        if(!isNaN(num) && num > highestNum) {
            highestNum = num
        }
    }

    const data = {
        userId,
        assessorId: user.publicMetadata.personId,
        date: new Date(),
        name: `${year} #${highestNum+1}`,
    }
    console.log(data)

    const createdSession = await prisma.skillCheckSession.create({
        data
    })

    redirect(Paths.competencies.session(createdSession.id))
}