/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/skill-packages/[skill_package_id]/skills/[skill_id]/--delete
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { DeleteSkillForm } from '@/components/forms/delete-skill'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import * as Paths from '@/paths'


export default function DeleteSkillDialog(props: { params: Promise<{ skill_package_id: string, skill_id: string }> }) {
    const { skill_package_id: skillPackageId, skill_id: skillId } = use(props.params)

    const router = useRouter()

    return <Dialog open onOpenChange={open => { if(!open) router.back() }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Package</DialogTitle>
                <DialogDescription>Permanently delete skill package?</DialogDescription>
            </DialogHeader>
            <DialogBody>
                <DeleteSkillForm
                    skillId={skillId}
                    onClose={() => router.back()}
                    onDelete={() => router.push(Paths.system.skillPackage(skillPackageId).index)}
                />
            </DialogBody>
        </DialogContent>
    </Dialog>

}