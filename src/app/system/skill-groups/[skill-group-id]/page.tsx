/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skil-groups/[skill-group-id]
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


export default async function SkillGroupPage(props: { params: Promise<{ 'skill-group-id': string }>}) {
    const { 'skill-group-id': skillGroupId } = await props.params
    if(!validateUUID(skillGroupId)) throw new Error(`Invalid skill-group-id (${skillGroupId}) in path`)

    const skillGroup = await prisma.skillGroup.findUnique({
        include: {
            skills: true,
            skillPackage: true,
        },
        where: { id: skillGroupId }
    })

    if(!skillGroup) return <NotFound/>

    return <AppPage>
        <AppPageBreadcrumbs
            label={skillGroup.name} 
            breadcrumbs={[
                { label: "System", href: Paths.system.index }, 
                { label: "Skill Groups", href: Paths.system.skillGroups.index }
            ]}
        />
        <AppPageContent>
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

                            <DLTerm>Package</DLTerm>
                            <DLDetails>
                                <Link href={Paths.system.skillPackages.skillPackage(skillGroup.skillPackageId).index}>{skillGroup.skillPackage.name}</Link>
                            </DLDetails>
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
                                        <TableCell>
                                            <Link href={Paths.system.skills.skill(skill.id).index}>{skill.name}</Link>
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