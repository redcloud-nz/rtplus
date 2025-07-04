/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { DeleteSkillDialog } from '@/components/dialogs/delete-skill'
import { EditSkillDialog } from '@/components/dialogs/edit-skill'

import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'
import { TextLink } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

export function SkillDetailsCard_sys({ skillId, skillPackageId }: { skillId: string, skillPackageId: string }) {
    const router = useRouter()

    const [action, setAction] = useState<'Edit' | 'Delete' | null>(null)

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size='icon' onClick={() => setAction('Edit')}>
                        <PencilIcon/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Skill</TooltipContent>
            </Tooltip>

            <DropdownMenu>
                <DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Skill Options">
                    <EllipsisVerticalIcon/>
                </DropdownMenuTriggerButton>

                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel className="text-center">Skill</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setAction('Edit')}>
                            <PencilIcon className="mr-1"/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAction('Delete')}>
                            <TrashIcon className="mr-1"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>

        <CardBody boundary collapsible>
            <SkillDetailsList_sys skillId={skillId} />
        </CardBody>
        {match(action)
            .with('Edit', () => 
                <EditSkillDialog 
                    open onOpenChange={() => setAction(null)} 
                    skillId={skillId}
                />
            )
            .with('Delete', () => 
                <DeleteSkillDialog 
                    open onOpenChange={() => setAction(null)}
                    onDelete={() => router.push(Paths.system.skillPackages(skillPackageId).index)}
                    skillId={skillId}
                />
            )
            .otherwise(() => null)}
    </Card>
}

export function SkillDetailsList_sys({ skillId }: { skillId: string }) {
    const trpc = useTRPC()

    const { data: skill } = useSuspenseQuery(trpc.skills.byId.queryOptions({ skillId }))

    return <DL>
        <DLTerm>Skill ID</DLTerm>
        <DLDetails>{skill.id}</DLDetails>

        <DLTerm>Skill Package</DLTerm>
        <DLDetails>
            <TextLink href={Paths.system.skillPackages(skill.skillPackageId).index}>{skill.skillPackage.name}</TextLink>
        </DLDetails>

        <DLTerm>Skill Group</DLTerm>
        <DLDetails>
            <TextLink href={Paths.system.skillPackages(skill.skillPackageId).groups(skill.skillGroupId).index}>{skill.skillGroup.name}</TextLink>
        </DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{skill.name}</DLDetails>

        <DLTerm>Description</DLTerm>
        <DLDetails>{skill.description}</DLDetails>

        <DLTerm>Frequency</DLTerm>
        <DLDetails>{skill.frequency}</DLDetails>
        
        <DLTerm>Optional</DLTerm>
        <DLDetails>{skill.optional ? 'Yes' : 'No'}</DLDetails>

        <DLTerm>Status</DLTerm>
        <DLDetails>{skill.status}</DLDetails>
    </DL>
}