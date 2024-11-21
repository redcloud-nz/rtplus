
import { EllipsisVerticalIcon, PencilIcon, PlusIcon } from 'lucide-react'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound, Unauthorized } from '@/components/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { ExternalLink, Link } from '@/components/ui/link'
import { Table, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import * as Paths from '@/paths'



export default async function TeamPage({ params }: { params: { teamIdOrCode: string }}) {

    const user = await currentUser()
    if(!user) return <Unauthorized label="Team"/>

    const team = await prisma.team.findFirst({
        where: {
            OR: [
                { id: params.teamIdOrCode },
                { code: params.teamIdOrCode }
            ]
        }
    })

    if(!team) return <NotFound />

    return <AppPage
        label={team.code || team.name}
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Teams", href: Paths.teams }]}
    >
        <PageHeader>
            <PageTitle>{team.name}</PageTitle>
            <PageControls>
                <Button variant="ghost">
                    <EllipsisVerticalIcon/>
                </Button>
            </PageControls>
        </PageHeader>
        
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <Button variant="ghost" asChild>
                        <Link href={Paths.editTeam(params.teamIdOrCode)}><PencilIcon/></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>RT+ ID</DLTerm>
                        <DLDetails>{team.id}</DLDetails>

                        <DLTerm>Team name</DLTerm>
                        <DLDetails>{team.name}</DLDetails>

                        <DLTerm>Short name/code</DLTerm>
                        <DLDetails>{team.code}</DLDetails>

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
                    <CardTitle>Members</CardTitle>
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
                    </Table>
                </CardContent>
                
            </Card>
        </CardGrid>
        
        
    </AppPage>
}