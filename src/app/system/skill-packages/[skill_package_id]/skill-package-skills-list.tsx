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


export function SkillPackageSkillsListCard_sys({ skillPackageId }: { skillPackageId: string }) {
    return <Card>
        <CardHeader>
            <CardTitle>Skills</CardTitle>
            {/* <DialogTriggerButton variant="ghost" size="icon" tooltip="Create Skill Group">
                <PlusIcon/>
            </DialogTriggerButton> */}
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <SkillPackageSkillsListTable_sys skillPackageId={skillPackageId}/>
        </CardBody>
    </Card>
}

function SkillPackageSkillsListTable_sys({ skillPackageId }: { skillPackageId: string }) {
    const trpc = useTRPC()

    const { data: skillGroups } = useSuspenseQuery(trpc.skillGroups.all.queryOptions({}))
    const { data: skills } = useSuspenseQuery(trpc.skills.all.queryOptions({}))
    const filteredByPackage = skills.filter(skill => skill.skillPackageId === skillPackageId)

    return <Show
        when={skills.length > 0}
        fallback={<Alert severity="info" title="No skill defined"/>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Group</TableHeadCell>
                    <TableHeadCell className='text-center'>Status</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredByPackage.map(skill =>
                    <TableRow key={skill.id}>
                        <TableCell>
                            <TextLink href={Paths.system.skillGroups.skillGroup(skill.id).index}>
                                {skill.name}
                            </TextLink>
                        </TableCell>
                        <TableCell>
                            {skill.skillGroupId
                                ? <TextLink href={Paths.system.skillGroups.skillGroup(skill.skillGroupId).index}>
                                    {skillGroups.find(group => group.id === skill.skillGroupId)?.name ?? 'Unknown Group'}
                                  </TextLink>
                                : null}
                        </TableCell>
                        <TableCell className='text-center'>{skill.status}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}