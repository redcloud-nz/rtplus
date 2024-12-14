
import _ from 'lodash'
import { EllipsisVerticalIcon, PencilIcon, PlusIcon } from 'lucide-react'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound, Unauthorized } from '@/components/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { ExternalLink, Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import * as Paths from '@/paths'


export default async function TeamPage({ params }: { params: { teamIdOrRef: string }}) {

    const user = await currentUser()
    if(!user) return <Unauthorized label="Team"/>

    // Get the team and all team members
    const team = await prisma.team.findFirst({
        include: {
            memberships: {
                include: {
                    person: true
                }
            },
        },
        where: {
            OR: [
                { id: params.teamIdOrRef },
                { ref: params.teamIdOrRef }
            ]
        }
    })

    if(!team) return <NotFound />

    const members = _.sortBy(team.memberships, (member) => member.person.name)

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
                            {members.map(membership => 
                                <TableRow key={membership.id}>
                                    <TableCell>{membership.person.name}</TableCell>
                                    <TableCell>{membership.position}</TableCell>
                                </TableRow>
                            )}
                            
                        </TableBody>
                    </Table>
                </CardContent>
                
            </Card>
        </CardGrid>
        
        
    </AppPage>
}