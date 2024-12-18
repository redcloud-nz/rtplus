

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'

import * as Paths from '@/paths'

export default async function SkillPackagePage({ params }: { params: { packageIdOrRef: string }}) {

    const skillPackages = await prisma.skillPackage.findFirst({
        include: {
            skillGroups: true
        },
        where: {
            OR: [
                { id: params.packageIdOrRef },
                { ref: params.packageIdOrRef }
            ]
        }
    })

    if(!skillPackages) return <NotFound/>

    return <AppPage
        label={skillPackages.ref || skillPackages.name} 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Packages", href: Paths.skillPackages }]}
    >
        <PageHeader>
            <PageTitle objectType="Skill Package">{skillPackages.name}</PageTitle>
            
        </PageHeader>
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>RT+ ID</DLTerm>
                        <DLDetails>{skillPackages.id}</DLDetails>

                        <DLTerm>Name</DLTerm>
                        <DLDetails>{skillPackages.name}</DLDetails>

                        <DLTerm>Ref</DLTerm>
                        <DLDetails>{skillPackages.ref}</DLDetails>
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
                            {skillPackages.skillGroups.map(skillGroup => 
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