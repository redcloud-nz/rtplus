/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FunnelIcon, PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { UnderConstruction } from '@/components/under-construction'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle, CardCollapseToggleButton } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

import { CreatePersonDialog } from './create-person-dialog'




/**
 * Card that displays the list of all personnel and allows the user to create a new person.
 */
export function PersonnelListCard() {
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <CreatePersonDialog
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add person">
                    <PlusIcon/>
                </DialogTriggerButton>}
            />
            <UnderConstruction>
                <Button variant="ghost" size="icon">
                    <FunnelIcon/>
                </Button>
            </UnderConstruction>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <PersonnelListTable/>
        </CardBody>
        
    </Card>
}

function PersonnelListTable() {
    const trpc = useTRPC()

    const { data: personnel } = useSuspenseQuery(trpc.personnel.all.queryOptions())

    return <Show 
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
    
}