/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/teams/[team-slug]
 */

import { EllipsisVerticalIcon, PencilIcon } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/ui/color'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DialogTriggerButton } from '@/components/ui/dialog'

import prisma from '@/server/prisma'
import * as Paths from '@/paths'

import { TeamMembersCard } from './team-members-card'
import { TeamOptionsMenu } from './team-options-menu'
import { D4hServerCode, getD4hServer } from '@/lib/d4h-api/servers'
import { UpdateTeamDialog } from './update-team-dialog'




export const metadata: Metadata = {
    title: "Team",
    description: "RT+ Team Configuration",
};

export default async function TeamPage(props: { params: Promise<{ 'team-slug': string }>}) {
    const { 'team-slug': teamSlug } = await props.params

    const team = await prisma.team.findUnique({
        where: { slug: teamSlug },
        include: { d4hInfo: true }
    })

    if(!team) notFound()

    return <AppPage>
        <AppPageBreadcrumbs
            label={team.shortName || team.name}
            breadcrumbs={[
                { label: "Configure", href: Paths.system.index }, 
                { label: "Teams", href: Paths.system.teams.index }
            ]}
        />
        <AppPageContent>
            <PageHeader>
                <PageTitle objectType="Team">{team.name}</PageTitle>
                <PageControls>
                    <TeamOptionsMenu
                        teamId={team.id}
                        trigger={<Button variant="ghost"><EllipsisVerticalIcon/></Button>}
                    />
                </PageControls>
            </PageHeader>
            
            <CardGrid>
                <Card>
                    <CardHeader>
                        <CardTitle>Team Details</CardTitle>
                        <UpdateTeamDialog 
                            trigger={<DialogTriggerButton tooltip="Edit Team"><PencilIcon/></DialogTriggerButton>} 
                            team={team}
                        />
                    </CardHeader>
                    <CardContent>
                        <DL>
                            <DLTerm>RT+ ID</DLTerm>
                            <DLDetails>{team.id}</DLDetails>

                            <DLTerm>Name</DLTerm>
                            <DLDetails>{team.name}</DLDetails>

                            <DLTerm>Short Name</DLTerm>
                            <DLDetails>{team.shortName}</DLDetails>

                            <DLTerm>Slug</DLTerm>
                            <DLDetails>{team.slug}</DLDetails>

                            <DLTerm>Colour</DLTerm>
                            <DLDetails><ColorValue value={team.color}/></DLDetails>

                            {team.d4hInfo?.serverCode ? <>
                                <DLTerm>D4H Server</DLTerm>
                                <DLDetails>{getD4hServer(team.d4hInfo.serverCode as D4hServerCode).name}</DLDetails>
                            </> : null}
                            {team.d4hInfo?.d4hTeamId ? <>
                                <DLTerm>D4H Team ID</DLTerm>
                                <DLDetails>{team.d4hInfo.d4hTeamId}</DLDetails>
                            </> : null}
                        </DL>
                    </CardContent>
                </Card>
                <TeamMembersCard teamId={team.id}/>
            </CardGrid>
        </AppPageContent>
    </AppPage>
}



