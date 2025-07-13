/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'




/**
 * Card that displays the details of a skill package and allows the user to edit it.
 * @param skillPackageId The ID of the skill package to display.
 */
export function SkillPackageDetailsCard({ skillPackageId }: { skillPackageId: string }) {

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>

            <Button variant="ghost" size="icon" asChild>
                <Link href={Paths.system.skillPackage(skillPackageId).update}>
                    <PencilIcon /> <span className="sr-only">Edit Skill Package</span>
                </Link>
            </Button>

            <DropdownMenu>
                <DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Skill Package Options">
                    <EllipsisVerticalIcon/>
                </DropdownMenuTriggerButton>
                
                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel className="text-center">Skill Package</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href={Paths.system.skillPackage(skillPackageId).update}>
                                <PencilIcon className="mr-1" /> Edit
                            </Link>
                        </DropdownMenuItem>
                            
                        <DropdownMenuItem asChild>
                            <Link href={Paths.system.skillPackage(skillPackageId).delete}>
                                <TrashIcon className="mr-1" /> Delete
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>
        <CardContent boundary collapsible>
            <SkillPackageDetailsList skillPackageId={skillPackageId}/>
        </CardContent>

    </Card>
}

function SkillPackageDetailsList({ skillPackageId }: { skillPackageId: string }) {
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

