/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/skill-packages/[skill_package_id]/skills/[skill_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { UpdateSkillForm } from '@/components/forms/update-skill'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'



export default function UpdateSkillSheet(props: { params: Promise<{ skill_id: string}> }) {
    const { skill_id: skillId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Update Skill</SheetTitle>
                <SheetDescription>Edit the details of this skill.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <UpdateSkillForm 
                    skillId={skillId}
                    onClose={() => router.back()} 
                />
            </SheetBody>
        </SheetContent>
    </Sheet>
}