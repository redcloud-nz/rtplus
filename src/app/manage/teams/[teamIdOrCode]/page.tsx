
import { PencilIcon, PlusIcon } from 'lucide-react'

import prisma from '@/lib/prisma'

import { AppPage, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Table, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

import { Paths } from '@/paths'
import { Link } from '@/components/ui/link'


export default async function TeamPage({ params }: { params: { teamIdOrCode: string }}) {

    const team = await prisma.team.findFirst({
        where: {
            OR: [
                { id: params.teamIdOrCode },
                { code: params.teamIdOrCode }
            ]
        }
    })

    if(team) {
        return <AppPage
            label={team.code || team.name}
            breadcrumbs={[{ label: "Teams", href: Paths.teams }]}
        >
            <PageTitle className="">{team.name}</PageTitle>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8 mb-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <Button variant="ghost" asChild>
                            <Link href={Paths.editTeam(params.teamIdOrCode)}><PencilIcon/></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DL>
                            <DLTerm>Team name</DLTerm>
                            <DLDetails>{team.name}</DLDetails>

                            <DLTerm>Short name/code</DLTerm>
                            <DLDetails>{team.code}</DLDetails>
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
            </div>
            
           
        </AppPage>
    } else return <NotFound />
}