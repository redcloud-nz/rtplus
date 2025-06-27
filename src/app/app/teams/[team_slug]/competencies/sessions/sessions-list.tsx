/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { FiltersPopover, StatusFilter, useFilters } from '@/components/filters'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'

import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { TeamBasic, useTRPC } from '@/trpc/client'



export function MySessionsListCard({ team }: { team: TeamBasic }) {
    return <Card>
        <CardHeader>
            <CardTitle>My Sessions</CardTitle>
        </CardHeader>
        <CardBody boundary>
            <SessionsListTable team={team} />
        </CardBody>
    </Card>
}

function SessionsListTable({ team }: { team: TeamBasic }) {
    const trpc = useTRPC()

    const { data: sessions } = useSuspenseQuery(trpc.skillCheckSessions.mySessions.all.queryOptions())

    return <Show 
        when={sessions.length > 0}
        fallback={<Alert severity="info" title="No existing sessions.">Add one to get started.</Alert>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Date</TableHeadCell>
                    <TableHeadCell className='w-32 hidden md:table-cell text-center'>Skills</TableHeadCell>
                    <TableHeadCell className='w-32 hidden md:table-cell text-center'>Assessees</TableHeadCell>
                    <TableHeadCell className='w-32 hidden md:table-cell text-center'>Checks</TableHeadCell>
                    <TableHeadCell className='text-center'>Status</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {sessions
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((session) => (
                        <TableRow key={session.id}>
                            <TableCell>
                                <Link href={Paths.team(team.slug).competencies.sessions.session(session.id).index}>{session.name}</Link>
                            </TableCell>
                            <TableCell>{formatISO(session.date, { representation: 'date' })}</TableCell>
                            <TableCell className='hidden md:table-cell text-center'>{session._count.skills}</TableCell>
                            <TableCell className='hidden md:table-cell text-center'>{session._count.assessees}</TableCell>
                            <TableCell className='hidden md:table-cell text-center'>{session._count.checks}</TableCell>
                            <TableCell className='text-center'>{session.sessionStatus}</TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    </Show>
}