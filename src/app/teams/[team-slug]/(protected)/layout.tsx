/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /teams/[team-slug]
 */

import { TeamParams } from '@/app/teams/[team-slug]'
import { AppPage, AppPageContainer } from '@/components/app-page'
import { Alert } from '@/components/ui/alert'
import { OrganizationList } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'


export default async function TeamLayout(props: { children: React.ReactNode,  params: Promise<TeamParams>}) {

    const { 'team-slug': teamSlug } = await props.params
    const { orgSlug } = await auth()

    if(teamSlug != orgSlug) {
        return <AppPageContainer>
            <AppPage variant="centered" label="Invalid Team">
                <div className="flex flex-col items-center gap-4">
                    <Alert severity="error" title="Invalid Team">{`Sorry you do not have acces to the team '${teamSlug}'.`}</Alert>
                    <OrganizationList
                        hideSlug={false}
                        hidePersonal={false}
                        afterSelectOrganizationUrl="/teams/:slug/dashboard"
                        afterSelectPersonalUrl="/me"
                    />
                </div>
                
            </AppPage>
        </AppPageContainer>
    } else {
        return props.children
    }
}