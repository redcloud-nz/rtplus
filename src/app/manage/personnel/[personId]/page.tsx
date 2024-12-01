import { EllipsisVerticalIcon, PencilIcon, PlusIcon } from 'lucide-react'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound, Unauthorized } from '@/components/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import * as Paths from '@/paths'



export default async function PersonPage({ params }: { params: { personId: string }}) {

    const user = await currentUser()
    if(!user) return <Unauthorized label="User"/>

    const person = await prisma.person.findFirst({
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            memberships: {
                select: {
                    id: true,
                    team: true
                }
            }
        },
        where: {
            id: params.personId
        }
    })
    if(!person) return <NotFound/>

    return <AppPage
        label={person.name}
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "People", href: Paths.personnel }]}
    >
        <PageHeader>
            <PageTitle objectType="Person">{person.name}</PageTitle>
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
                        <Link href={Paths.editPerson(params.personId)}><PencilIcon/></Link>
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
                            {person.memberships.map(membership =>
                                <TableRow key={membership.id}>
                                    <TableCell>{membership.team.ref || membership.team.name}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </CardGrid>
    </AppPage>
}