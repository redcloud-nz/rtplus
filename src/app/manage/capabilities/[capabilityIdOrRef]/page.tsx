

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'

import * as Paths from '@/paths'

export default async function CapabilityPage({ params }: { params: { capabilityIdOrRef: string }}) {

    const capability = await prisma.capability.findFirst({
        include: {
            skillGroups: true
        },
        where: {
            OR: [
                { id: params.capabilityIdOrRef },
                { ref: params.capabilityIdOrRef }
            ]
        }
    })

    if(!capability) return <NotFound/>

    return <AppPage
        label={capability.ref || capability.name} 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Capabilities", href: Paths.capabilities }]}
    >
        <PageHeader>
            <PageTitle objectType="Capability">{capability.name}</PageTitle>
            
        </PageHeader>
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>RT+ ID</DLTerm>
                        <DLDetails>{capability.id}</DLDetails>

                        <DLTerm>Name</DLTerm>
                        <DLDetails>{capability.name}</DLDetails>

                        <DLTerm>Ref</DLTerm>
                        <DLDetails>{capability.ref}</DLDetails>
                    </DL>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Skill Groups</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell>Name</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {capability.skillGroups.map(skillGroup => 
                                <TableRow key={skillGroup.id}>
                                    <TableCell>{skillGroup.name}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </CardGrid>
    </AppPage>
}