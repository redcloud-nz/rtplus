/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/personnel/[person-id]
 */

import { KeyRoundIcon, PencilIcon } from 'lucide-react'
import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { validateUUID } from '@/lib/id'
import * as Paths from '@/paths'
import prisma from '@/server/prisma'


export const metadata: Metadata = { title: "Personnel" }

export default async function PersonPage(props: { params: Promise<{ 'person-id': string }>}) {
    const { 'person-id': personId } = await props.params

    const person = validateUUID(personId) ? await prisma.person.findUnique({
        include: {
            teamMemberships: {
                include: {
                    team: true
                }
            },
        },
        where: { id: personId }
    }) : null
    if(!person) return <NotFound/>

    return <AppPage>
        <AppPageBreadcrumbs
            label={person.name}
            breadcrumbs={[
                { label: "Configure", href: Paths.config.index }, 
                { label: "Personnel", href: Paths.config.personnel.index }
            ]}
        />
        <AppPageContent>
            <PageHeader>
                <PageTitle objectType="Person">{person.name}</PageTitle>
                <PageControls>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Link href={Paths.config.personnel.person(person.id).access}>
                                    <KeyRoundIcon/>
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">RT+ Access</TooltipContent>
                    </Tooltip>
                </PageControls>
            </PageHeader>
            <CardGrid>
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <Button variant="ghost" asChild>
                            <Link href={Paths.config.personnel.person(personId).edit}><PencilIcon/></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DL>
                            <DLTerm>RT+ ID</DLTerm>
                            <DLDetails>{person.id}</DLDetails>

                            <DLTerm>Name</DLTerm>
                            <DLDetails>{person.name}</DLDetails>
                            
                            <DLTerm>Email</DLTerm>
                            <DLDetails>{person.email}</DLDetails>
                        </DL>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Memberships</CardTitle>
                        {/* <Protect permission="system:write">
                            <Button variant="ghost"><PlusIcon/></Button>
                        </Protect> */}
                    
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell>Team</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {person.teamMemberships.map(membership =>
                                    <TableRow key={membership.id}>
                                        <TableCell>
                                            <Link href={Paths.config.teams.team(membership.team.id).index}>
                                                {membership.team.shortName || membership.team.name}
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </CardGrid>
        </AppPageContent>
       
    </AppPage>
}