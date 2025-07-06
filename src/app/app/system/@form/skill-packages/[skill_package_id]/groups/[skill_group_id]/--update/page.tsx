/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/skill-packages/[skill_package_id]/groups/[skill_group_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { UpdateSkillGroupForm } from '@/components/forms/update-skill-group'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'


export default function UpdateSkillGroupSheet(props: { params: Promise<{ skill_group_id: string}> }) {
    const { skill_group_id: skillGroupId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Update Skill Group</SheetTitle>
                <SheetDescription>Edit the details of the skill group.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <UpdateSkillGroupForm 
                    skillGroupId={skillGroupId}
                    onClose={() => router.back()} 
                />
            </SheetBody>
        </SheetContent>
    </Sheet>
}