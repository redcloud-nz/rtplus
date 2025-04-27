/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/skills/--new
 */


import { NotImplemented } from '@/components/errors'
import * as Paths from '@/paths'

export default async function NewSkillPage() {

    return <NotImplemented 
        label="New Skill" 
        breadcrumbs={[
            { label: "Configure", href: Paths.system.index}, 
            { label: "Skills", href: Paths.system.skills.index }
        ]}
    />
}