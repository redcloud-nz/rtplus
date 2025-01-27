/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/personnel/[personId]
 */

import { KeyRoundIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Metadata } from 'next'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { validateUUID } from '@/lib/id'
import prisma from '@/lib/server/prisma'
import { formatDateTime } from '@/lib/utils'
import * as Paths from '@/paths'

export const metadata: Metadata = { title: "Personnel | RT+" }

export default async function PersonPage(props: { params: Promise<{ personId: string }>}) {
    const { personId } = await props.params
    if(!validateUUID(personId)) throw new Error(`Invalid personId (${personId}) in path`)

    const person = await prisma.person.findUnique({
        include: {
            teamMemberships: {
                include: {
                    team: true
                }
            },
        },
        where: { id: personId }
    })
    if(!person) return <NotFound/>

    return <AppPage
        label={person.name}
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Personnel", href: Paths.personnel }]}
    >
        <PageHeader>
            <PageTitle objectType="Person">{person.name}</PageTitle>
            <PageControls>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Link href={Paths.personAccess(person.id)}>
                                <KeyRoundIcon/>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">RT+ Access</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Trash2Icon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Delete Person</TooltipContent>
                </Tooltip>
                
                
            </PageControls>
        </PageHeader>
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <Button variant="ghost" asChild>
                        <Link href={Paths.editPerson(personId)}><PencilIcon/></Link>
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

                        <DLTerm>Created</DLTerm>
                        <DLDetails>{formatDateTime(person.createdAt)}</DLDetails>

                        <DLTerm>Updated</DLTerm>
                        <DLDetails>{formatDateTime(person.updatedAt)}</DLDetails>
                    </DL>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Memberships</CardTitle>
                    <Button variant="ghost"><PlusIcon/></Button>
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
                                        <Link href={Paths.teams.team(membership.team.id).index}>
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
    </AppPage>
}