/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin
 */

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotFound } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default function SkillsModule_NotFound() {
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[Paths.skillsModule]}
        />
        <NotFound/>
    </AppPage>
}