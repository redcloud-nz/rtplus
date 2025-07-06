/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/skill-packages/[skill_package_id]/groups/[skill_group_id]/--delete
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { DeleteSkillGroupForm } from '@/components/forms/delete-skill-group'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import * as Paths from '@/paths'


export default function DeleteSkillGroupDialog(props: { params: Promise<{ skill_package_id: string, skill_group_id: string }> }) {
    const { skill_package_id: skillPackageId, skill_group_id: skillGroupId } = use(props.params)

    const router = useRouter()

    return <Dialog open onOpenChange={open => { if(!open) router.back() }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Package</DialogTitle>
                <DialogDescription>Permanently delete skill package?</DialogDescription>
            </DialogHeader>
            <DialogBody>
                <DeleteSkillGroupForm
                    skillGroupId={skillGroupId}
                    onClose={() => router.back()}
                    onDelete={() => router.push(Paths.system.skillPackage(skillPackageId).index)}
                />
            </DialogBody>
        </DialogContent>
    </Dialog>

}