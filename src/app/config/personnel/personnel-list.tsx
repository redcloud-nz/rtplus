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


export function PersonnelList() {
    const [personnel] = trpc.personnel.all.useSuspenseQuery()

    return <Show 
            when={personnel.length > 0}
            fallback={<Alert severity="info" title="No people defined">Add some people to get started.</Alert>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell className="w-1/2">Name</TableHeadCell>
                        <TableHeadCell className="w-1/2">Email</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {personnel.map(person =>
                        <TableRow key={person.id}>
                            <TableCell>
                                <Link href={Paths.config.personnel.person(person.id).index}>{person.name}</Link>
                            </TableCell>
                            <TableCell>{person.email}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
}