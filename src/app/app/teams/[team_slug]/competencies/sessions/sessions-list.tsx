/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { AsyncButton, Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useListOptions } from '@/hooks/use-list-options'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



type ListOptions = { showDraft: boolean, showComplete: boolean, showDiscarded: boolean }

export function MySessionsListCard({ teamSlug }: { teamSlug: string }) {
    const router = useRouter()
    const trpc = useTRPC()

    const createMutation = useMutation(trpc.skillCheckSessions.mySessions.init.mutationOptions({}))

    const { options, handleOptionChange } = useListOptions<ListOptions>({ showDraft: true, showComplete: true, showDiscarded: false  })

    async function handleCreateSession() {
        const newSession = await createMutation.mutateAsync()
        // Redirect to the new session page
        router.push(Paths.team(teamSlug).competencies.session(newSession.id).index)
    }

    return <Card>
        <CardHeader>
            <CardTitle>My Sessions</CardTitle>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AsyncButton variant="ghost" size="icon" onClick={handleCreateSession}>
                        <PlusIcon /> <span className="sr-only">New Session</span>
                    </AsyncButton>
                </TooltipTrigger>
                <TooltipContent>
                    Start new skill check session.
                </TooltipContent>
            </Tooltip>
            

            <CardMenu title="Sessions">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                        checked={options.showDraft} 
                        onCheckedChange={handleOptionChange('showDraft')}
                    >Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                        checked={options.showComplete} 
                        onCheckedChange={handleOptionChange('showComplete')}
                    >Complete</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                        checked={options.showDiscarded} 
                        onCheckedChange={handleOptionChange('showDiscarded')}
                    >Discarded</DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
            </CardMenu>
        </CardHeader>
        <CardContent boundary>
            <SessionsListTable teamSlug={teamSlug} options={options}/>
        </CardContent>
    </Card>
}

function SessionsListTable({ teamSlug, options }: { teamSlug: string, options: ListOptions }) {
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
                                <Link href={Paths.team(teamSlug).competencies.session(session.id).index}>{session.name}</Link>
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