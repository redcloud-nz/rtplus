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
import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { TextLink } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


export function SkillPackageGroupsListCard_sys({ skillPackageId }: { skillPackageId: string }) {
    return <Card>
        <CardHeader>
            <CardTitle>Groups</CardTitle>
            {/* <DialogTriggerButton variant="ghost" size="icon" tooltip="Create Skill Group">
                <PlusIcon/>
            </DialogTriggerButton> */}
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <SkillPackageGroupsListTable_sys skillPackageId={skillPackageId}/>
        </CardBody>
    </Card>
}

function SkillPackageGroupsListTable_sys({ skillPackageId }: { skillPackageId: string }) {
    const trpc = useTRPC()

    const { data: skillGroups } = useSuspenseQuery(trpc.skillGroups.all.queryOptions({}))
    const filteredByPackage = skillGroups.filter(skillGroup => skillGroup.skillPackageId === skillPackageId)

    return <Show
        when={skillGroups.length > 0}
        fallback={<Alert severity="info" title="No skill groups defined"/>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell className="text-center">Skill Count</TableHeadCell>
                    <TableHeadCell className='text-center'>Status</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredByPackage.map(skillGroup =>
                    <TableRow key={skillGroup.id}>
                        <TableCell>
                            <TextLink href={Paths.system.skillGroups.skillGroup(skillGroup.id).index}>
                                {skillGroup.name}
                            </TextLink>
                        </TableCell>
                        <TableCell className="text-center">{skillGroup._count.skills}</TableCell>
                        <TableCell className='text-center'>{skillGroup.status}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}