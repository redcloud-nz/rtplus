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

import { DeleteSkillGroupDialog } from '@/components/dialogs/delete-skill-group'
import { EditSkillGroupDialog } from '@/components/dialogs/edit-skill-group'

import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'
import { TextLink } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function SkillGroupDetailsCard_sys({ skillGroupId, skillPackageId }: { skillGroupId: string, skillPackageId: string }) {
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
                <TooltipContent>Edit Skill Group</TooltipContent>
            </Tooltip>
            <DropdownMenu>
                <DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Skill Group Options">
                    <EllipsisVerticalIcon/>
                </DropdownMenuTriggerButton>
                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel className="text-center">Skill Group</DropdownMenuLabel>
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
            <SkillGroupDetailsList_sys skillGroupId={skillGroupId}/>
        </CardBody>

        {match(action)
            .with('Edit', () => 
                <EditSkillGroupDialog 
                    open onOpenChange={() => setAction(null)} 
                    skillGroupId={skillGroupId}
                />
            )
            .with('Delete', () => 
                <DeleteSkillGroupDialog 
                    open onOpenChange={() => setAction(null)}
                    onDelete={() => router.push(Paths.system.skillPackages.skillPackage(skillPackageId).index)}
                    skillGroupId={skillGroupId}
                />
            )
            .otherwise(() => null)}
    </Card>
}

function SkillGroupDetailsList_sys({ skillGroupId }: { skillGroupId: string }) {
    const trpc = useTRPC()

    const { data: skillGroup } = useSuspenseQuery(trpc.skillGroups.byId.queryOptions({ skillGroupId }))

    return <DL>
        <DLTerm>Skill Group ID</DLTerm>
        <DLDetails>{skillGroup.id}</DLDetails>

        <DLTerm>Skill Package</DLTerm>
        <DLDetails>
            <TextLink href={Paths.system.skillPackages.skillPackage(skillGroup.skillPackageId).index}>{skillGroup.skillPackage.name}</TextLink>
        </DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{skillGroup.name}</DLDetails>

        <DLTerm>Description</DLTerm>
        <DLDetails>{skillGroup.description || <span className="text-muted-foreground">No description provided.</span>}</DLDetails>
    </DL>
}