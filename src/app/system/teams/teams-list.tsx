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


export function TeamsList() {
    const [teams] = trpc.teams.all.useSuspenseQuery()

    return <Show
        when={teams.length > 0}
        fallback={<Alert severity="info" title="No teams defined.">Add a team to get started.</Alert>}
    >
        <Table border>
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
                            <Link href={Paths.system.teams.team(team.slug).index}>{team.name}</Link>
                        </TableCell>
                        <TableCell>{team.shortName}</TableCell>
                        <TableCell className='text-center'><ColorValue value={team.color}/></TableCell>
                        <TableCell className='text-center'>{team._count.teamMemberships}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}