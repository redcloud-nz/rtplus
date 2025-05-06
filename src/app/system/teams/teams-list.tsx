/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/ui/color'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


export function TeamsList() {
    const teamsQuery = trpc.teams.all.useQuery()

    const teams = teamsQuery.data || []

    return <Card loading={teamsQuery.isLoading}>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" asChild>
                        <Link href={Paths.system.teams.create}>
                            <PlusIcon size={48}/>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Add Team
                </TooltipContent>
            </Tooltip>
        </CardHeader>
        <CardContent>
            <Show
                when={teams.length > 0}
                fallback={<Alert severity="info" title="No teams defined.">Add a team to get started.</Alert>}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Short Name</TableHeadCell>
                            <TableHeadCell className="text-center">Colour</TableHeadCell>
                            <TableHeadCell className='text-center'>Members</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.map(team => 
                            <TableRow key={team.id}>
                                <TableCell>
                                    <Link href={Paths.system.teams.team(team.id).index} className="hover:underline">{team.name}</Link>
                                </TableCell>
                                <TableCell>{team.shortName}</TableCell>
                                <TableCell className='text-center'>{ team.color ? <ColorValue value={team.color}/> : null }</TableCell>
                                <TableCell className='text-center'>{team._count.teamMemberships}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Show>
        </CardContent>     
    </Card>
}