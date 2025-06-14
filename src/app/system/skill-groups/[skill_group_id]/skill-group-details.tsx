/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Card, CardBody, CardHeader, CardTitle, CardCollapseToggleButton } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { TextLink } from '@/components/ui/link'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'
import { EditSkillGroupDialog_sys } from './edit-skill-group'




export function SkillGroupDetailsCard_sys({ skillGroupId }: { skillGroupId: string }) {
    return <Card>
        <CardHeader>
            <CardTitle>Skill Group Details</CardTitle>
            <EditSkillGroupDialog_sys
                skillGroupId={skillGroupId}
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Edit Skill Group">
                    <PencilIcon/>
                </DialogTriggerButton>}
            />
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <SkillGroupDetailsList_sys skillGroupId={skillGroupId}/>
        </CardBody>
    </Card>
}

function SkillGroupDetailsList_sys({ skillGroupId }: { skillGroupId: string }) {
    const trpc = useTRPC()

    const { data: skillGroup } = useSuspenseQuery(trpc.skillGroups.byId.queryOptions({ skillGroupId }))

    return <DL>
        <DLTerm>RT+ ID</DLTerm>
        <DLDetails>{skillGroup.id}</DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{skillGroup.name}</DLDetails>

        <DLTerm>Package</DLTerm>
        <DLDetails>
            <TextLink href={Paths.system.skillPackages.skillPackage(skillGroup.skillPackageId).index}>{skillGroup.skillPackage.name}</TextLink>
        </DLDetails>

        {skillGroup.parent && <>
            <DLTerm>Parent Group</DLTerm>
            <DLDetails>
                <TextLink href={Paths.system.skillGroups.skillGroup(skillGroup.parent.id).index}>{skillGroup.parent.name}</TextLink>
            </DLDetails>
        </>}

        <DLTerm>Status</DLTerm>
        <DLDetails>{skillGroup.status}</DLDetails>
    </DL>
}