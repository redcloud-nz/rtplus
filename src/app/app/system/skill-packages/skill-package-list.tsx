/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useSuspenseQuery } from '@tanstack/react-query'

import { CreateSkillPackageDialog } from '@/components/dialogs/create-skill-package'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Card, CardBody, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { TextLink } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'
import { StatusOptions, useListOptions } from '@/hooks/use-list-options'



export function SkillPackageListCard_sys() {
    const router = useRouter()

    const { options, handleOptionChange } = useListOptions({})

    return <Card>
        <CardHeader>
            <CardTitle>Package list</CardTitle>
            <CreateSkillPackageDialog
                onCreate={skillPackage => router.push(Paths.system.skillPackages.skillPackage(skillPackage.id).index)}
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Create Skill Package">
                    <PlusIcon/>
                </DialogTriggerButton>}
            />
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
        <CardBody boundary>
            <SkillPackageListTable_sys options={options}/>
        </CardBody>
    </Card>
}

function SkillPackageListTable_sys({ options }: { options: StatusOptions }) {
    const trpc = useTRPC()

    const { data: skillPackages } = useSuspenseQuery(trpc.skillPackages.all.queryOptions({}))
    const filteredRows = skillPackages.filter(skillPackage => 
        skillPackage.status == 'Active' ? options.showActive = true : options.showInactive = true
    )

    return <Show
        when={filteredRows.length > 0}
        fallback={skillPackages.length == 0
            ? <Alert severity="info" title="No skill packages defined"/>
            : <Alert severity="info" title="No skill packages match the selected filters">Adjust your filters to see more skill packages.</Alert>
        }
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    
                    <TableHeadCell className="text-center">Groups in Package</TableHeadCell>
                    <TableHeadCell className="text-center">Skill in Package</TableHeadCell>
                    { options.showInactive ? <TableHeadCell className="text-center">Status</TableHeadCell> : null}
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredRows.map(skillPackage =>
                    <TableRow key={skillPackage.id}>
                        <TableCell>
                            <TextLink href={Paths.system.skillPackages.skillPackage(skillPackage.id).index}>{skillPackage.name}</TextLink>
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
    </Show>
}