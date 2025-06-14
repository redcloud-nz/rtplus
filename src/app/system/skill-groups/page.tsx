/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-groups
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'
import { SkillGroupListCard_sys } from './skill-group-list'


export const metadata: Metadata = { title: "Skill Groups" }

export default async function SkillGroupListPage() {

    return <AppPage>
        <AppPageBreadcrumbs
            label="Skill Groups"
            breadcrumbs={[{ label: "System", href: Paths.system.index }]}
        />
        
        <AppPageContent variant='container'>
            <PageHeader>
                <PageTitle>Manage Skill Groups</PageTitle>
                <PageDescription>Manage the skill groups available in RT+.</PageDescription>
            </PageHeader>
            <SkillGroupListCard_sys/>
        </AppPageContent>
    </AppPage>
}