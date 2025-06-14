/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { FiltersPopover, StatusFilter, useFilters } from '@/components/filters'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { TextLink } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

import { CreateSkillPackageDialog_sys } from './create-skill-package'

type Filters = { status: ('Active' | 'Inactive')[] }

export function SkillPackageListCard_sys() {
    const filters = useFilters<Filters>({
        defaultValues: { status: ['Active', 'Inactive'] },
    })

    return <Card>
        <CardHeader>
            <CardTitle>Package list</CardTitle>
            <CreateSkillPackageDialog_sys trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Create Skill Package">
                <PlusIcon/>
            </DialogTriggerButton>}/>
            <FiltersPopover>
                <StatusFilter control={filters.control.status} />
            </FiltersPopover>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <SkillPackageListTable_sys state={filters.state}/>
        </CardBody>
    </Card>
}

function SkillPackageListTable_sys({ state }: { state: Filters}) {
    const trpc = useTRPC()

    const { data: skillPackages } = useSuspenseQuery(trpc.skillPackages.all.queryOptions({}))
    const filteredRows = skillPackages.filter(skillPackage => state.status.includes(skillPackage.status))

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
                    <TableHeadCell className="text-center">Status</TableHeadCell>
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
                        <TableCell className="text-center">{skillPackage.status}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}