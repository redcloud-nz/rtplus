/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardMenu } from '@/components/ui/card'
import { DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { StatusOptions, useListOptions } from '@/hooks/use-list-options'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'





/**
 * Card that displays the list of all personnel and allows the user to create a new person.
 */
export function PersonnelListCard() {
    
    const { options, handleOptionChange } = useListOptions({})

    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <Button variant="ghost" size="icon" asChild>
                <Link href={Paths.system.personnel.create} title="Create New Person">
                    <PlusIcon />
                </Link>
            </Button>
            
            <CardMenu title="Personnel">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                        checked={options.showActive} 
                        onCheckedChange={handleOptionChange('showActive')}
                    >Active</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                        checked={options.showInactive} 
                        onCheckedChange={handleOptionChange('showInactive')}
                    >Inactive</DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
            </CardMenu>
        </CardHeader>
        <CardContent boundary>
            <PersonnelListTable options={options}/>
        </CardContent>
        
    </Card>
}


function PersonnelListTable({ options }: { options: StatusOptions }) {
    const trpc = useTRPC()

    const { data: personnel } = useSuspenseQuery(trpc.personnel.all.queryOptions())
    const filteredPersonnel = personnel.filter(person => 
        person.status == 'Active' ? options.showActive = true : options.showInactive = true
    )
    
    return <Show 
        when={filteredPersonnel.length > 0}
        fallback={personnel.length === 0
            ? <Alert severity="info" title="No people defined">Add a person to get started.</Alert>
            : <Alert severity="info" title="No people match the selected filters">Adjust your filters to see more personnel.</Alert>
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
                            <TextLink href={Paths.system.person(person.id).index}>{person.name}</TextLink>
                        </TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>{person.status}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
    
}