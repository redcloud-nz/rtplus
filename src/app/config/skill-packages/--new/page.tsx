/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/skill-packages/--new
 */

import { auth } from '@clerk/nextjs/server'

import { NotImplemented } from '@/components/errors'
import * as Paths from '@/paths'

export default async function NewSkillPackagePage() {
    auth.protect()

    return <NotImplemented 
        label="Skill Package" 
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index }, 
            { label: "Skill Packages", href: Paths.config.skillPackages.index }
        ]}
    />
}