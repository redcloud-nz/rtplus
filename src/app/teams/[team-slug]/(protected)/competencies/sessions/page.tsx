/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team-slug]/competencies/sessions
 */

import { formatISO } from 'date-fns'
import { SquarePenIcon } from 'lucide-react'
import { redirect } from 'next/navigation'


import { TeamParams } from '@/app/teams/[team-slug]'
import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Form, FormSubmitButton } from '@/components/ui/action-form'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { authenticated } from '@/server/auth'
import { FormState } from '@/lib/form-state'
import prisma from '@/server/prisma'

import * as Paths from '@/paths'
import { assertNonNull } from '@/lib/utils'




export default async function SkillCheckSessionListPage(props: { params: Promise<TeamParams>}) {

    const { 'team-slug': teamSlug } = await props.params
    const competenciesPath = Paths.team(teamSlug).competencies

    const { userId } = await authenticated()

    const sessions = await prisma.skillCheckSession.findMany({
        where: { userId },
        include: {
            _count: {
                select: { skills: true, assessees: true, checks: true }
            }
        }
    })

    return <AppPage 
        label="My Sessions" 
        breadcrumbs={[
            { label: "Competencies", href: competenciesPath.dashboard }
        ]}
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
            when={sessions.length > 0}
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
                    {sessions.map((assessment, index) => 
                        <TableRow key={assessment.id}>
                            <TableCell><Link href={competenciesPath.session(assessment.id)}>{assessment.name || `#${index+1}`}</Link></TableCell>
                            <TableCell>{formatISO(assessment.date, { representation: 'date' })}</TableCell>
                            <TableCell className="hidden md:table-cell text-center ">{assessment._count.skills}</TableCell>
                            <TableCell className="hidden md:table-cell text-center">{assessment._count.assessees}</TableCell>
                            <TableCell className="hidden md:table-cell text-center">{assessment._count.checks}</TableCell>
                            <TableCell className="text-center">{assessment.sessionStatus}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>
}

async function createSessionAction(): Promise<FormState> {
    'use server'

    const { userId, userPersonId, teamSlug } = await authenticated()

    assertNonNull(userPersonId, "User is not connected to a person")
    assertNonNull(teamSlug, "No active team")

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

    const createdSession = await prisma.skillCheckSession.create({
        data: {
            userId,
            assessorId: userPersonId,
            date: new Date(),
            name: `${year} #${highestNum+1}`,
        }
    })

    redirect(Paths.team(teamSlug).competencies.session(createdSession.id))
}