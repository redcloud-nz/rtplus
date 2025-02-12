/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/skills/new
 */

import { auth } from '@clerk/nextjs/server'

import { NotImplemented } from '@/components/errors'
import * as Paths from '@/paths'

export default async function NewSkillPage() {
    await auth.protect()

    return <NotImplemented 
        label="New Skill" 
        breadcrumbs={[{ label: "Manage", href: Paths.system }, { label: "Skills", href: Paths.skillsList }]}
    />
}