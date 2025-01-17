/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/teams/[teamIdOrRef]
 */

import { EllipsisVerticalIcon, PencilIcon, PlusIcon } from 'lucide-react'
import * as R from 'remeda'

import { auth } from '@clerk/nextjs/server'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { ExternalLink, Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import * as Paths from '@/paths'
import { createWhereClause } from '@/lib/id'


export default async function TeamPage(props: { params: Promise<{ teamIdOrRef: string }>}) {
    const params = await props.params;

    const { orgId } = await auth.protect()

    // Get the team and all team members
    const team = await prisma.team.findFirst({
        where: {
            orgId,
            ...createWhereClause(params.teamIdOrRef)
        },
        include: {
            memberships: {
                include: {
                    person: true
                }
            },
        },
        orderBy: {
            name: 'asc'
        }
    })

    if(!team) return <NotFound />

    return <AppPage
        label={team.ref || team.name}
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Teams", href: Paths.teams }]}
    >
        <PageHeader>
            <PageTitle objectType="Team">{team.name}</PageTitle>
            <PageControls>
                <Button variant="ghost">
                    <EllipsisVerticalIcon/>
                </Button>
            </PageControls>
        </PageHeader>
        
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                    <Button variant="ghost" asChild>
                        <Link href={Paths.editTeam(params.teamIdOrRef)}><PencilIcon/></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>RT+ ID</DLTerm>
                        <DLDetails>{team.id}</DLDetails>

                        <DLTerm>Name</DLTerm>
                        <DLDetails>{team.name}</DLDetails>

                        <DLTerm>Ref</DLTerm>
                        <DLDetails>{team.ref}</DLDetails>

                        <DLTerm>Colour</DLTerm>
                        <DLDetails>{team.color}</DLDetails>

                        {team.d4hTeamId > 0 && <>
                            <DLTerm>D4H Team ID</DLTerm>
                            <DLDetails>{team.d4hTeamId}</DLDetails>
                        </>}

                        <DLTerm>D4H API URL</DLTerm>
                        <DLDetails>{team.d4hApiUrl}</DLDetails>

                        <DLTerm>D4H Web URL</DLTerm>
                        <DLDetails>
                            <ExternalLink href={team.d4hWebUrl}>{team.d4hWebUrl}</ExternalLink>
                        </DLDetails>
                    </DL>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <Button variant="ghost"><PlusIcon/></Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Position</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {R.pipe(
                                team.memberships,
                                R.sortBy((member) => member.person.name),
                                R.map(membership => 
                                    <TableRow key={membership.id}>
                                        <TableCell>
                                            <Link href={Paths.person(membership.person.id)}>{membership.person.name}</Link>
                                        </TableCell>
                                        <TableCell>{membership.position}</TableCell>
                                    </TableRow>
                                )
                            )}
                            
                        </TableBody>
                    </Table>
                </CardContent>
                
            </Card>
        </CardGrid>
        
        
    </AppPage>
}