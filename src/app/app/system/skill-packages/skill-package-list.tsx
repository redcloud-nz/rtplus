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
import { Card, CardContent, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { useListOptions } from '@/hooks/use-list-options'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function SkillPackageListCard() {
    const trpc = useTRPC()

    const { data: skillPackages } = useSuspenseQuery(trpc.skillPackages.all.queryOptions({}))

    const { options, handleOptionChange } = useListOptions({})

    const filtered = skillPackages.filter(skillPackage => 
        skillPackage.status == 'Active' ? options.showActive : options.showInactive
    )

    return <Card>
        <CardHeader>
            <CardTitle>Packages</CardTitle>
            <Button variant="ghost" size="icon" asChild>
                <Link href={Paths.system.skillPackages.create}>
                    <PlusIcon/>
                </Link>
            </Button>
            <CardMenu title="Skill Package">
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
        <CardContent>
            <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    
                    <TableHeadCell>Groups in Package</TableHeadCell>
                    <TableHeadCell>Skill in Package</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell> : null
                </TableRow>
            </TableHead>
            <TableBody>
                <Show when={skillPackages.length == 0}>
                        <tr>
                            <td colSpan={4}>
                                <Alert severity="info" title="No skill-packages defined"/>
                            </td>
                        </tr>
                    </Show>
                    <Show when={skillPackages.length > 0 && filtered.length == 0}>
                        <tr>
                            <td colSpan={4}>
                                <Alert severity="info" title="No skill-packages match the selected filters">
                                    Adjust your filters to see more skill-packages.
                                </Alert>
                            </td>
                        </tr>
                    </Show>
                {filtered.map(skillPackage =>
                    <TableRow key={skillPackage.id}>
                        <TableCell>
                            <TextLink href={Paths.system.skillPackage(skillPackage.id).index}>{skillPackage.name}</TextLink>
                        </TableCell>
                        <TableCell className="text-center">
                            {skillPackage._count.skillGroups}
                        </TableCell>
                        <TableCell className="text-center">
                            {skillPackage._count.skills}
                        </TableCell>
                        { options.showInactive ? <TableCell className="text-center">{skillPackage.status}</TableCell> : null }
                    </TableRow>
                )}
            </TableBody>
        </Table>
        </CardContent>
    </Card>
}