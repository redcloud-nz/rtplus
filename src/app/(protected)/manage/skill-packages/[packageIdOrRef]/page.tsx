/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/skill-packages/[packageIdOrRef]
 */

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { createWhereClause } from '@/lib/id'
import prisma from '@/lib/prisma'

import * as Paths from '@/paths'


export default async function SkillPackagePage(props: { params: Promise<{ packageIdOrRef: string }>}) {
    const params = await props.params

    const skillPackages = await prisma.skillPackage.findFirst({
        include: {
            skillGroups: true
        },
        where: createWhereClause(params.packageIdOrRef)
    })

    if(!skillPackages) return <NotFound/>

    return <AppPage
        label={skillPackages.ref || skillPackages.name} 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Packages", href: Paths.skillPackagesList }]}
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
                                    <TableCell>
                                        <Link href={Paths.skillGroup(skillGroup.ref || skillGroup.id)}>{skillGroup.name}</Link>
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