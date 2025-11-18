/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]
 */
'use client'

import { use, useState } from 'react'

import { Protect } from '@clerk/clerk-react'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { CreateNewIcon, DeleteObjectIcon, DropdownMenuTriggerIcon, DuplicateObjectIcon, EditObjectIcon, ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { Heading } from '@/components/ui/typography'
import { S2_Value } from '@/components/ui/s2-value'
import { useOrganization } from '@/hooks/use-organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


import { AdminModule_DeleteTeam_Dialog } from './delete-team'
import { AdminModule_TeamMembers } from './team-members'




export default function AdminModule_Team_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]'>) {
    const { org_slug: orgSlug, team_id: teamId } = use(props.params)
    
    const organization = useOrganization()

    const { data: team } = useSuspenseQuery(trpc.teams.getTeam.queryOptions({ orgId: organization.orgId, teamId }))

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    
    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(orgSlug).admin.teams}>
                        <ToParentPageIcon/> Team List
                    </Link>
                </S2_Button>
                <Protect role="org:admin">
                    <ButtonGroup>
                        <S2_Button variant="outline" asChild>
                            <Link to={Paths.org(orgSlug).admin.team(team.teamId).update}>
                                <EditObjectIcon/> Edit
                            </Link>
                        </S2_Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <S2_Button variant="outline" size="icon">
                                    <DropdownMenuTriggerIcon/>
                                </S2_Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Team</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem disabled>
                                        <DuplicateObjectIcon/> Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteDialogOpen(true)}>
                                        <DeleteObjectIcon/> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AdminModule_DeleteTeam_Dialog
                            organization={organization}
                            team={team}
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                        />
                    </ButtonGroup>
                </Protect>
            </Hermes.SectionHeader>
            <S2_Card>
                <S2_CardHeader>
                    <S2_CardTitle>{team.name}</S2_CardTitle>
                    <S2_CardDescription>ID: {team.teamId}</S2_CardDescription>
                </S2_CardHeader>
                <S2_CardContent>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldLabel>Status</FieldLabel>
                            <S2_Value value={team.status} className="min-w-1/2"/>
                        </Field>
                    </FieldGroup>
                </S2_CardContent>
            </S2_Card>
        </Hermes.Section>

        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.SectionTitle>Team Members</Hermes.SectionTitle>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).admin.team(team.teamId).members.create}>
                        <CreateNewIcon/> Member
                    </Link>
                </S2_Button>
            </Hermes.SectionHeader>

            <AdminModule_TeamMembers organization={organization} teamId={team.teamId}/>
        </Hermes.Section>

        
        
    </Lexington.Column>
 }