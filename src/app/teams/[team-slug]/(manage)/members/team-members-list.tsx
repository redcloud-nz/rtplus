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


export function TeamMembersList() {
    const [members] = trpc.currentTeam.members.useSuspenseQuery()

    return <Show 
            when={members.length > 0}
            fallback={<Alert severity="info" title="No members defined">Add some members to get started.</Alert>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell className="w-1/2">Name</TableHeadCell>
                        <TableHeadCell className="w-1/2">Email</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {members.map(member =>
                        <TableRow key={member.id}>
                            <TableCell>
                                <Link href={Paths.system.personnel.person(member.id).index}>{member.person.name}</Link>
                            </TableCell>
                            <TableCell>{member.person.email}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
}