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

import { DeleteSkillPackageDialog } from '@/components/dialogs/delete-skill-package'
import { EditSkillPackageDialog } from '@/components/dialogs/edit-skill-package'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



/**
 * Card that displays the details of a skill package and allows the user to edit it.
 * @param skillPackageId The ID of the skill package to display.
 */
export function SkillPackageDetailsCard_sys({ skillPackageId }: { skillPackageId: string }) {
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
                <TooltipContent>Edit Skill Package</TooltipContent>
            </Tooltip>

            <DropdownMenu>
                <DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Skill Package Options">
                    <EllipsisVerticalIcon/>
                </DropdownMenuTriggerButton>
                
                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel className="text-center">Skill Package</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setAction('Edit')}>
                            <PencilIcon className="mr-1"/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAction('Delete')}>
                            <TrashIcon className="mr-1" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>
        <CardBody boundary collapsible>
            <SkillPackageDetailsList_sys skillPackageId={skillPackageId}/>
        </CardBody>

        {match(action)
            .with('Edit', () => 
                <EditSkillPackageDialog 
                    open onOpenChange={() => setAction(null)} 
                    skillPackageId={skillPackageId} 
                />
            )
            .with('Delete', () => 
                <DeleteSkillPackageDialog 
                    open onOpenChange={() => setAction(null)}
                    onDelete={() => router.push(Paths.system.skillPackages.index)}
                    skillPackageId={skillPackageId}  
                />
            )
            .otherwise(() => null)}
    </Card>
}

function SkillPackageDetailsList_sys({ skillPackageId }: { skillPackageId: string }) {
    const trpc = useTRPC()

    const { data: skillPackage } = useSuspenseQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))

    return <DL>
        <DLTerm>Skill Package ID</DLTerm>
        <DLDetails>{skillPackage.id}</DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{skillPackage.name}</DLDetails>

        <DLTerm>Description</DLTerm>
        <DLDetails>{skillPackage.description}</DLDetails>

        <DLTerm>Status</DLTerm>
        <DLDetails>{skillPackage.status}</DLDetails>
    </DL>
}

