/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]
 */

'use client'

import { useRouter } from 'next/navigation'
import { use, useState } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Lexington } from '@/components/blocks/lexington'
import { DeleteTeamMembershipDialog } from '@/components/dialogs/delete-team-membership'
import { DeleteObjectIcon, DropdownMenuTriggerIcon, EditObjectIcon, ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link, TextLink } from '@/components/ui/link'
import { S2_Value } from '@/components/ui/s2-value'

import { useOrganization } from '@/hooks/use-organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'





export default function AdminModule_Person_TeamMembership_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]'>) {
    const { person_id: personId, team_id: teamId } = use(props.params)
    const organization = useOrganization()
    const router = useRouter()
    
    const { data: teamMembership } = useSuspenseQuery(trpc.teamMemberships.getTeamMembership.queryOptions({ orgId: organization.orgId, personId, teamId }))

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return <Lexington.Column width="lg">
        <Lexington.ColumnControls>
            <S2_Button variant="outline" asChild>
                <Link to={Paths.org(organization.slug).admin.person(personId)}>
                    <ToParentPageIcon/> {teamMembership.person.name}
                </Link>
            </S2_Button>
            <Protect role="org:admin">
                <ButtonGroup>
                    <S2_Button variant="outline" asChild>
                        <Link to={Paths.org(organization.slug).admin.person(personId).teamMembership(teamMembership.team.teamId).update}>
                            <EditObjectIcon/> <span className="hidden md:inline">Edit</span>
                        </Link>
                    </S2_Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <S2_Button variant="outline" size="icon">
                                <DropdownMenuTriggerIcon/>
                            </S2_Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteDialogOpen(true)}>
                                    <DeleteObjectIcon/> Delete
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DeleteTeamMembershipDialog
                        onDelete={() => router.push(Paths.org(organization.slug).admin.person(personId).href)}
                        onOpenChange={setDeleteDialogOpen}
                        open={deleteDialogOpen}
                        organization={organization}
                        personId={teamMembership.personId}
                        teamId={teamMembership.teamId}
                    />
                </ButtonGroup>
            </Protect>
        </Lexington.ColumnControls>
        <S2_Card>
            <S2_CardHeader>
                <S2_CardTitle>Team Membership</S2_CardTitle>
                <S2_CardDescription><span className="font-medium">{teamMembership.person.name}</span> in <span className="font-medium">{teamMembership.team.name}</span>.</S2_CardDescription>
            </S2_CardHeader>
            <S2_CardContent>
                <FieldGroup>
                    <Field orientation="responsive">
                        <FieldLabel>Team</FieldLabel>
                        <div></div>
                        <S2_Value className="min-w-1/2">
                            <TextLink to={Paths.org(organization.slug).admin.team(teamMembership.team.teamId)}>{teamMembership.team.name}</TextLink>
                        </S2_Value>
                    </Field>
                    <Field orientation="responsive">
                        <FieldLabel>Status</FieldLabel>
                        <S2_Value value={teamMembership.status} className="min-w-1/2"/>
                    </Field>
                </FieldGroup>
            </S2_CardContent>
        </S2_Card>
    </Lexington.Column>

}