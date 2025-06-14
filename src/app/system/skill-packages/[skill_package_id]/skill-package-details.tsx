/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { EditSkillPackageDialog_sys } from '@/components/dialogs/edit-skill-package'
import { Card, CardBody, CardHeader, CardTitle, CardCollapseToggleButton } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import { useTRPC } from '@/trpc/client'



/**
 * Card that displays the details of a skill package and allows the user to edit it.
 * @param skillPackageId The ID of the skill package to display.
 */
export function SkillPackageDetailsCard_sys({ skillPackageId }: { skillPackageId: string }) {
    return <Card>
        <CardHeader>
            <CardTitle>Package details</CardTitle>
            <EditSkillPackageDialog_sys
                skillPackageId={skillPackageId}
                trigger={<DialogTriggerButton variant="ghost" size='icon' tooltip="Edit Skill Package">
                    <PencilIcon/>
                </DialogTriggerButton>}
            />
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <SkillPackageDetailsList_sys skillPackageId={skillPackageId}/>
        </CardBody>
    </Card>
}

function SkillPackageDetailsList_sys({ skillPackageId }: { skillPackageId: string }) {
    const trpc = useTRPC()

    const { data: skillPackage } = useSuspenseQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))

    return <DL>
        <DLTerm>RT+ ID</DLTerm>
        <DLDetails>{skillPackage.id}</DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{skillPackage.name}</DLDetails>

        <DLTerm>Status</DLTerm>
        <DLDetails>{skillPackage.status}</DLDetails>
    </DL>
}