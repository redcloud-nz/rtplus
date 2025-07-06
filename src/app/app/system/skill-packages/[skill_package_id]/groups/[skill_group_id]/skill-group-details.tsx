/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function SkillGroupDetailsCard({ skillGroupId, skillPackageId }: { skillGroupId: string, skillPackageId: string }) {
    const router = useRouter()

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <Button variant="ghost" size="icon" asChild>
                <Link href={Paths.system.skillPackage(skillPackageId).group(skillGroupId).update}>
                    <PencilIcon/> <span className="sr-only">Edit Skill Group</span>
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Skill Group Options">
                    <EllipsisVerticalIcon/>
                </DropdownMenuTriggerButton>
                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel className="text-center">Skill Group</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href={Paths.system.skillPackage(skillPackageId).group(skillGroupId).update}>
                                <PencilIcon className="mr-1"/> Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={Paths.system.skillPackage(skillPackageId).group(skillGroupId).delete}>
                                <TrashIcon className="mr-1"/> Delete
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>
        <CardBody boundary collapsible>
            <SkillGroupDetailsList skillGroupId={skillGroupId}/>
        </CardBody>
    </Card>
}

function SkillGroupDetailsList({ skillGroupId }: { skillGroupId: string }) {
    const trpc = useTRPC()

    const { data: skillGroup } = useSuspenseQuery(trpc.skillGroups.byId.queryOptions({ skillGroupId }))

    return <DL>
        <DLTerm>Skill Group ID</DLTerm>
        <DLDetails>{skillGroup.id}</DLDetails>

        <DLTerm>Skill Package</DLTerm>
        <DLDetails>
            <TextLink href={Paths.system.skillPackage(skillGroup.skillPackageId).index}>{skillGroup.skillPackage.name}</TextLink>
        </DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{skillGroup.name}</DLDetails>

        <DLTerm>Description</DLTerm>
        <DLDetails>{skillGroup.description || <span className="text-muted-foreground">No description provided.</span>}</DLDetails>
    </DL>
}