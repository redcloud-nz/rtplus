/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FunnelIcon, PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardMenu, CardExplanation } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { StatusOptions, useListOptions } from '@/hooks/use-list-options'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


/**
 * Card that displays the list of all personnel and allows the user to create a new person.
 */
export function PersonnelListCard() {
    const trpc = useTRPC()

    const { options, handleOptionChange } = useListOptions({})

    const { data: personnel } = useSuspenseQuery(trpc.personnel.all.queryOptions())
    const filtered = personnel.filter(person => 
        person.status == 'Active' ? options.showActive : options.showInactive
    )

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
            <Separator orientation="vertical"/>
            <CardExplanation>
                Personnel are the people who can be assigned to teams and competencies. 
                They can be active or inactive, and you can filter the list by status.
            </CardExplanation>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell className="w-2/5">Name</TableHeadCell>
                        <TableHeadCell className="w-2/5">Email</TableHeadCell>
                        <TableHeadCell className="w-1/5">
                            <div>Status</div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <FunnelIcon/>
                                    </Button>
                                    </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>Show</DropdownMenuLabel>
                                        <DropdownMenuCheckboxItem
                                            checked={options.showActive} 
                                            onCheckedChange={handleOptionChange('showActive')}
                                        >Active</DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem 
                                            checked={options.showInactive} 
                                            onCheckedChange={handleOptionChange('showInactive')}
                                        >Inactive</DropdownMenuCheckboxItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <Show when={personnel.length == 0}>
                        <TableRow>
                            <TableCell colSpan={3}>
                                <Alert severity="info" title="No personnel defined">Add a person to get started.</Alert>
                            </TableCell>
                        </TableRow>
                    </Show>
                    <Show when={personnel.length > 0 && filtered.length == 0}>
                        <TableRow>
                            <TableCell colSpan={3}>
                                <Alert severity="info" title="No personnel match the selected filters">Adjust your filters to see more personnel.</Alert>
                            </TableCell>
                        </TableRow>
                    </Show>
                    {filtered.map((person: any) =>
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
        </CardContent>
        
    </Card>
}