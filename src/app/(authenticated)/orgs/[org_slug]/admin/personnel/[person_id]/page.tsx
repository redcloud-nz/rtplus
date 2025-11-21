/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]
 */
'use client'

import { use, useState } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { CreateNewIcon, DeleteObjectIcon, DropdownMenuTriggerIcon, DuplicateObjectIcon, EditObjectIcon, ToParentPageIcon } from '@/components/icons'
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

import { AdminModule_DeletePerson_Dialog } from './delete-person'
import { AdminModule_Person_TeamMembershipList } from './person-team-memberships'





export default function AdminModule_Person_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { person_id: personId } = use(props.params)
    const organization = useOrganization()

    const { data: person } = useSuspenseQuery(trpc.personnel.getPerson.queryOptions({ orgId: organization.orgId, personId }))

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).admin.personnel }>
                        <ToParentPageIcon/> Personnel List
                    </Link>
                </S2_Button>
                <Protect role="org:admin">
                    <ButtonGroup>
                        <S2_Button variant="outline" asChild>
                            <Link to={Paths.org(organization.slug).admin.person(personId).update}>
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                        <AdminModule_DeletePerson_Dialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                            organization={organization}
                            personId={person.personId}
                        />
                    </ButtonGroup>
                </Protect>
            </Hermes.SectionHeader>

            <S2_Card>
                <S2_CardHeader>
                    <S2_CardTitle>{person.name}</S2_CardTitle>
                    <S2_CardDescription>ID: {person.personId}</S2_CardDescription>
                </S2_CardHeader>
                <S2_CardContent>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldLabel>Email</FieldLabel>
                            <S2_Value value={person.email} className="min-w-1/2"/>
                        </Field>
                        <Protect role="org:admin">
                             <Field orientation="responsive">
                                <FieldLabel>Linked User ID</FieldLabel>
                                <S2_Value className="min-w-1/2">{person.userId 
                                    ? <TextLink to={Paths.org(organization.slug).admin.user(person.userId)}>{person.userId}</TextLink>
                                    : <span className="text-muted-foreground">Not linked</span>
                                }</S2_Value>
                            </Field>
                        </Protect>
                       
                        <Field orientation="responsive">
                            <FieldLabel>Status</FieldLabel>
                            <S2_Value value={person.status} className="min-w-1/2"/>
                        </Field>
                    </FieldGroup>
                </S2_CardContent>
            </S2_Card>
        </Hermes.Section>
        
        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.SectionTitle>Team Memberships</Hermes.SectionTitle>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).admin.person(personId).teamMemberships.create}>
                        <CreateNewIcon/> Team Membership
                    </Link>
                </S2_Button>
            </Hermes.SectionHeader>
            
            <AdminModule_Person_TeamMembershipList organization={organization} personId={person.personId}/>
        </Hermes.Section>
    </Lexington.Column>
}