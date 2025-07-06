/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


export function SkillDetailsCard({ skillId, skillPackageId }: { skillId: string, skillPackageId: string }) {

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <Button variant="ghost" size='icon' asChild>
                <Link href={Paths.system.skillPackage(skillPackageId).skill(skillId).update}>
                    <PencilIcon/> <span className="sr-only">Edit Skill</span>
                </Link>
            </Button>

            <DropdownMenu>
                <DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Skill Options">
                    <EllipsisVerticalIcon/>
                </DropdownMenuTriggerButton>

                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel className="text-center">Skill</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href={Paths.system.skillPackage(skillPackageId).skill(skillId).update}>
                                <PencilIcon className="mr-1"/> Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={Paths.system.skillPackage(skillPackageId).skill(skillId).delete}>
                                <TrashIcon className="mr-1"/> Delete
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>

        <CardBody boundary collapsible>
            <SkillDetailsList skillId={skillId} />
        </CardBody>
    </Card>
}

export function SkillDetailsList({ skillId }: { skillId: string }) {
    const trpc = useTRPC()

    const { data: skill } = useSuspenseQuery(trpc.skills.byId.queryOptions({ skillId }))

    return <DL>
        <DLTerm>Skill ID</DLTerm>
        <DLDetails>{skill.id}</DLDetails>

        <DLTerm>Skill Package</DLTerm>
        <DLDetails>
            <TextLink href={Paths.system.skillPackage(skill.skillPackageId).index}>{skill.skillPackage.name}</TextLink>
        </DLDetails>

        <DLTerm>Skill Group</DLTerm>
        <DLDetails>
            <TextLink href={Paths.system.skillPackage(skill.skillPackageId).group(skill.skillGroupId).index}>{skill.skillGroup.name}</TextLink>
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