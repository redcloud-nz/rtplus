/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FunnelIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle, CardCollapseToggleButton } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Link } from '@/components/ui/link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

import { CreatePersonDialog } from './create-person'



const STATUS_VALUES = ['Active', 'Inactive']

/**
 * Card that displays the list of all personnel and allows the user to create a new person.
 */
export function PersonnelListCard() {
    const [selectedStatuses, setSelectedStatuses] = useState([...STATUS_VALUES])
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <CreatePersonDialog
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add person">
                    <PlusIcon/>
                </DialogTriggerButton>}
            />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <FunnelIcon/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56">
                    <div className="font-bold text-center mb-2">Filters</div>
                    <StatusFilter selected={selectedStatuses} setSelected={setSelectedStatuses}/>
                </PopoverContent>
            </Popover>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <PersonnelListTable selectedStatuses={selectedStatuses}/>
        </CardBody>
        
    </Card>
}

function StatusFilter({ selected, setSelected }: { selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>> }) {
    return <div className="flex flex-col gap-2">
        <Label className="font-semibold">Status</Label>
        {STATUS_VALUES.map(status => (
            <Label key={status} className="flex items-center gap-2 pl-2 cursor-pointer">
                <Checkbox checked={selected.includes(status)} onCheckedChange={() => setSelected(s => s.includes(status) ? s.filter(x => x !== status) : [...s, status])} />
                <span>{status}</span>
            </Label>
        ))}
    </div>
}

function PersonnelListTable({ selectedStatuses }: { selectedStatuses: string[] }) {
    const trpc = useTRPC()

    const { data: personnel } = useSuspenseQuery(trpc.personnel.all.queryOptions())
    const filteredPersonnel = personnel.filter(person => selectedStatuses.includes(person.status))
    
    return <Show 
        when={filteredPersonnel.length > 0}
        fallback={personnel.length === 0
            ? <Alert severity="info" title="No people defined">Add some people to get started.</Alert>
            : <Alert severity="info" title="No people match the selected filters">Adjust your filters to see more people.</Alert>
        }
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
                {filteredPersonnel.map((person: any) =>
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