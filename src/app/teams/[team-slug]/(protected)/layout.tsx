/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /teams/[team-slug]
 */

import { OrganizationList } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

import { TeamParams } from '@/app/teams/[team-slug]'
import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Alert } from '@/components/ui/alert'


export default async function TeamLayout(props: { children: React.ReactNode,  params: Promise<TeamParams>}) {

    const { 'team-slug': teamSlug } = await props.params
    const { orgSlug } = await auth()

    if(teamSlug != orgSlug) {
        return <AppPage>
            <AppPageBreadcrumbs label="Invalid Team"/>
            <AppPageContent variant="centered">
                <div className="flex flex-col items-center gap-4">
                    <Alert severity="error" title="Invalid Team">{`Sorry you do not have acces to the team '${teamSlug}'.`}</Alert>
                    <OrganizationList
                        hideSlug={false}
                        hidePersonal={false}
                        afterSelectOrganizationUrl="/teams/:slug/dashboard"
                        afterSelectPersonalUrl="/me"
                    /> 
                </div>
                
            </AppPageContent>
        </AppPage>
    } else {
        return props.children
    }
}