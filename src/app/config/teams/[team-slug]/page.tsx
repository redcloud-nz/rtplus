/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/teams/[team-slug]
 */

import { EllipsisVerticalIcon, PencilIcon } from 'lucide-react'
import { Metadata } from 'next'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'
import { Protect } from '@/components/protect'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/ui/color'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import prisma from '@/server/prisma'
import * as Paths from '@/paths'

import { TeamMembersCard } from './team-members-card'
import { TeamOptionsMenu } from './team-options-menu'
import { D4hServerCode, getD4hServer } from '@/lib/d4h-api/servers'



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

    if(!team) return <NotFound />

    return <AppPage
        label={team.shortName || team.name}
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index }, 
            { label: "Teams", href: Paths.config.teams.index }
        ]}
    >
        <PageHeader>
            <PageTitle objectType="Team">{team.name}</PageTitle>
            <PageControls>
                <Protect permission='team:write' teamId={team.id} system='system:manage-teams'>
                    <TeamOptionsMenu
                        teamId={team.id}
                        trigger={<Button variant="ghost"><EllipsisVerticalIcon/></Button>}
                    />
                </Protect>
            </PageControls>
        </PageHeader>
        
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                    <Protect permission='team:write' teamId={team.id} system='system:manage-teams'>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" asChild>
                                    <Link href={Paths.config.teams.team(teamSlug).edit}><PencilIcon/></Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Team</TooltipContent>
                        </Tooltip>
                    </Protect>
                    
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
    </AppPage>
}



