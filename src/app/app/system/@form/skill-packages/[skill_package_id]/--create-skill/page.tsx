/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/skill-packages/[skill_package_id]/--create-skill
 */
'use client'

import { useRouter } from 'next/navigation'
import {  use } from 'react'

import { CreateSkillForm } from '@/components/forms/create-skill'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import * as Paths from '@/paths'


export default function CreateSkillSheet(props: { params: Promise<{ skill_package_id: string}> }) {
    const { skill_package_id: skillPackageId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>New Skill</SheetTitle>
                <SheetDescription>Create a new skill in this package.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <CreateSkillForm
                    skillPackageId={skillPackageId}
                    onClose={() => router.back()} 
                />
            </SheetBody>
        </SheetContent>
    </Sheet>

}