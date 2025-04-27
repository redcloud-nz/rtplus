/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/skill-packages/[skillPackageId]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { validateUUID } from '@/lib/id'
import prisma from '@/server/prisma'

import * as Paths from '@/paths'


export default async function SkillPackagePage(props: { params: Promise<{ skillPackageId: string }>}) {
    const {skillPackageId } = await props.params
    if(!validateUUID(skillPackageId)) throw new Error(`Invalid skillPackageId (${skillPackageId}) in path`)

    const skillPackages = await prisma.skillPackage.findFirst({
        include: {
            skillGroups: true
        },
        where: { id: skillPackageId}
    })

    if(!skillPackages) return <NotFound/>

    return <AppPage>
        <AppPageBreadcrumbs
            label={skillPackages.name} 
            breadcrumbs={[
                { label: "Configure", href: Paths.config.index }, 
                { label: "Packages", href: Paths.config.skillPackages.index }
            ]}
        />
        <AppPageContent>
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
                                            <Link href={Paths.config.skillGroups.skillGroup(skillGroup.id).index}>{skillGroup.name}</Link>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </CardGrid>
        </AppPageContent>
    </AppPage>
}