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


type Filters = { status: ('Active' | 'Inactive')[] }

export function SkillGroupListCard_sys() {
    const filters = useFilters<Filters>({
        defaultValues: { status: ['Active', 'Inactive'] },
    })

    return <Card>
        <CardHeader>
            <CardTitle>All Skill Groups</CardTitle>
            {/* <CreateSkillPackageDialog_sys trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Create Skill Package">
                <PlusIcon/>
            </DialogTriggerButton>}/> */}
            <FiltersPopover>
                <StatusFilter control={filters.control.status} />
            </FiltersPopover>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <SkillGroupListTable_sys state={filters.state}/>
        </CardBody>
    </Card>
}

function SkillGroupListTable_sys({ state }: { state: Filters }) {
    const trpc = useTRPC()

    const { data: skillGroups } = useSuspenseQuery(trpc.skillGroups.all.queryOptions({}))
    const filteredRows = skillGroups.filter(skillPackage => state.status.includes(skillPackage.status))

    return <Show
        when={filteredRows.length > 0}
        fallback={skillGroups.length == 0
            ? <Alert severity="info" title="No skill groups defined"/>
            : <Alert severity="info" title="No skill groups match the selected filters">Adjust your filters to see more skill groups.</Alert>
        }
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Package</TableHeadCell>
                    <TableHeadCell className="text-center">Skills in Group</TableHeadCell>
                    <TableHeadCell className="text-center">Status</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredRows.map(skillGroup =>
                    <TableRow key={skillGroup.id}>
                        <TableCell>
                            <TextLink href={Paths.system.skillGroups.skillGroup(skillGroup.id).index}>{skillGroup.name}</TextLink>
                        </TableCell>
                        <TableCell>{skillGroup.skillPackageId}</TableCell>
                        <TableCell className="text-center">
                            {skillGroup._count.skills}
                        </TableCell>
                        <TableCell className="text-center">{skillGroup.status}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}