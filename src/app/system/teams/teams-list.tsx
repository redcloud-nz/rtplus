/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { trpc } from '@/trpc/client'

import * as Paths from '@/paths'
import { ColorValue } from '@/components/ui/color'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateTeamDialog } from './create-team-dialog'
import { DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'


export function TeamsList() {
    const teamsQuery = trpc.teams.all.useQuery()

    return <Card loading={teamsQuery.isLoading}>
        <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CreateTeamDialog trigger={<DialogTrigger asChild>
                <Button>
                    <PlusIcon/> New Team
                </Button>
            </DialogTrigger>}/>
        </CardHeader>
        <CardContent>
            { teamsQuery.data && <Show
                when={teamsQuery.data.length > 0}
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
                        {teamsQuery.data.map(team => 
                            <TableRow key={team.id}>
                                <TableCell>
                                    <Link href={Paths.system.teams.team(team.slug).index}>{team.name}</Link>
                                </TableCell>
                                <TableCell>{team.shortName}</TableCell>
                                <TableCell className='text-center'><ColorValue value={team.color}/></TableCell>
                                <TableCell className='text-center'>{team._count.teamMemberships}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Show>}
        </CardContent>     
    </Card>
}