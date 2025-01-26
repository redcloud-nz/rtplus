/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments
 */

import { formatISO } from 'date-fns'
import { SquarePenIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Form, FormSubmitButton } from '@/components/ui/form'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { authenticated } from '@/lib/auth'
import { FormState } from '@/lib/form-state'
import prisma from '@/lib/prisma'

import * as Paths from '@/paths'


export default async function SkillCheckSessionListPage() {

    const { userPersonId } = await authenticated()

    const assessments = await prisma.skillCheckSession.findMany({
        where: { assessorId: userPersonId },
        include: {
            _count: {
                select: { skills: true, assessees: true, checks: true }
            }
        }
    })

    return <AppPage 
        label="My Sessions" 
        breadcrumbs={[{ label: "Competencies", href: Paths.competencies.dashboard }]}
    >
        <PageHeader>
            <PageTitle>Sessions</PageTitle>
            <PageControls>
                <Form action={createSessionAction}>
                    <FormSubmitButton
                        label={<><SquarePenIcon/> New <span className="hidden md:inline">Session</span></>}
                        loading="Creating"
                    />
                </Form>
            </PageControls>
        </PageHeader>
       <Show
            when={assessments.length > 0}
            fallback={<Alert severity="info" title="No existing sessions.">Add one to get started.</Alert>}
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

    const { userPersonId } = await authenticated()

    const year = new Date().getFullYear()

    const assessments = await prisma.skillCheckSession.findMany({
        select: { id: true, name: true },
        where: { assessorId: userPersonId, name: { startsWith: `${year} #`} },
    })

    let highestNum = 0
    for(const assessment of assessments) {
        const num = parseInt(assessment.name.slice(6))
        if(!isNaN(num) && num > highestNum) {
            highestNum = num
        }
    }

    const createdSession = await prisma.skillCheckSession.create({
        data: {
            assessorId: userPersonId,
            date: new Date(),
            name: `${year} #${highestNum+1}`,
        }
    })

    redirect(Paths.competencies.session(createdSession.id))
}