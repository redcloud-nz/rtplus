

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'


import prisma from '@/lib/prisma'

import * as Paths from '@/paths'


export default async function SkillGroupPage(props: { params: Promise<{ groupIdOrRef: string }>}) {
    const params = await props.params

    const skillGroup = await prisma.skillGroup.findFirst({
        include: {
            skills: true,
            package: true,
        },
        where: {
            OR: [
                { id: params.groupIdOrRef },
                { ref: params.groupIdOrRef }
            ]
        }
    })

    if(!skillGroup) return <NotFound/>

    return <AppPage
        label={skillGroup.ref || skillGroup.name} 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Skill Groups", href: Paths.skillGroupsAll }]}
    >
        <PageHeader>
            <PageTitle objectType="Skill Group">{skillGroup.name}</PageTitle>
            
        </PageHeader>
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>RT+ ID</DLTerm>
                        <DLDetails>{skillGroup.id}</DLDetails>

                        <DLTerm>Name</DLTerm>
                        <DLDetails>{skillGroup.name}</DLDetails>

                        <DLTerm>Ref</DLTerm>
                        <DLDetails>{skillGroup.ref}</DLDetails>

                        <DLTerm>Package</DLTerm>
                        <DLDetails>{skillGroup.package.name}</DLDetails>
                    </DL>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell>Name</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {skillGroup.skills.map(skill => 
                                <TableRow key={skill.id}>
                                    <TableCell>{skill.name}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </CardGrid>
    </AppPage>
}