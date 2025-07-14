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
import { Card, CardContent, CardExplanation, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { useListOptions } from '@/hooks/use-list-options'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function TeamsListCard() {

    const trpc = useTRPC()

    const { data: teams } = useSuspenseQuery(trpc.teams.all.queryOptions())

    const { options, handleOptionChange } = useListOptions({})
    
    const filtered = teams.filter(team => 
        team.status == 'Active' ? options.showActive : options.showInactive
    )
    
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <Button variant="ghost" size="icon" asChild>
                <Link href={Paths.system.teams.create} title="Create New Team">
                    <PlusIcon />
                </Link>
            </Button>

            <Separator orientation='vertical'/>
            <CardExplanation>
                This is a list of all teams in the system. You can filter by status to show only active or inactive teams.
            </CardExplanation>
            
        </CardHeader>
        <CardContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Short Name</TableHeadCell>
                        <TableHeadCell>Members</TableHeadCell>
                        <TableHeadCell className="w-45">
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
                    <Show when={teams.length == 0}>
                        <tr>
                            <td colSpan={4}>
                                <Alert severity="info" title="No teams defined"/>
                            </td>
                        </tr>
                    </Show>
                    <Show when={teams.length > 0 && filtered.length == 0}>
                        <tr>
                            <td colSpan={4}>
                                <Alert severity="info" title="No teams match the selected filters">
                                    Adjust your filters to see more teams.
                                </Alert>
                            </td>
                        </tr>
                    </Show>
                    {filtered
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((team) => 
                            <TableRow key={team.id}>
                                <TableCell>
                                    <TextLink href={Paths.system.team(team.id).index}>{team.name}</TextLink>
                                </TableCell>
                                <TableCell>{team.shortName}</TableCell>
                            
                                <TableCell>{team.memberCount}</TableCell>
                                <TableCell>{team.status}</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </CardContent>
    </Card>
}