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


export function SkillGroupSkillsListCard_sys({ skillGroupId }: { skillGroupId: string }) {
    return <Card>
        <CardHeader>
            <CardTitle>Skills in Group</CardTitle>
            {/* <DialogTriggerButton variant="ghost" size="icon" tooltip="Create Skill Group">
                <PlusIcon/>
            </DialogTriggerButton> */}
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <SkillGroupSkillsListTable_sys skillGroupId={skillGroupId}/>
        </CardBody>
    </Card>
}

function SkillGroupSkillsListTable_sys({ skillGroupId }: { skillGroupId: string }) {
    const trpc = useTRPC()

    const { data: skills } = useSuspenseQuery(trpc.skills.bySkillGroupId.queryOptions({ skillGroupId }))

    return <Show
        when={skills.length > 0}
        fallback={<Alert severity="info" title="No skill groups defined"/>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell className='text-center'>Status</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {skills.map(skill =>
                    <TableRow key={skill.id}>
                        <TableCell>
                            <TextLink href={Paths.system.skills.skill(skill.id).index}>
                                {skill.name}
                            </TextLink>
                        </TableCell>
                        <TableCell className='text-center'>{skill.status}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}