/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'


import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

export function PersonnelList() {
    const [personnel] = trpc.personnel.all.useSuspenseQuery()

    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" asChild>
                        <Link href={Paths.system.personnel.create}>
                            <PlusIcon size={48}/>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Add Person
                </TooltipContent>
            </Tooltip>
        </CardHeader>
        <CardContent>
            <Show 
                when={personnel.length > 0}
                fallback={<Alert severity="info" title="No people defined">Add some people to get started.</Alert>}
            >
                <Table width="auto">
                    <TableHead>
                        <TableRow>
                            <TableHeadCell className="w-2/5">Name</TableHeadCell>
                            <TableHeadCell className="w-2/5">Email</TableHeadCell>
                            <TableHeadCell className="w-1/5">Status</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {personnel.map(person =>
                            <TableRow key={person.id}>
                                <TableCell>
                                    <Link href={Paths.system.personnel.person(person.id).index} className="hover:underline">{person.name}</Link>
                                </TableCell>
                                <TableCell>{person.email}</TableCell>
                                <TableCell>{person.status}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Show>
        </CardContent>
    </Card>
    
}