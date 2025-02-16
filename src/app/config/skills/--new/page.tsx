/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/skills/--new
 */


import { NotImplemented } from '@/components/errors'
import * as Paths from '@/paths'
import { authenticated } from '@/server/auth'

export default async function NewSkillPage() {
    await authenticated()

    return <NotImplemented 
        label="New Skill" 
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index}, 
            { label: "Skills", href: Paths.config.skills.index }
        ]}
    />
}