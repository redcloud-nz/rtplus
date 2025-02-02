/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: //skills/[skillId]
 */

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Link } from '@/components/ui/link'
import { validateUUID } from '@/lib/id'

import prisma from '@/server/prisma'

import * as Paths from '@/paths'


export default async function SkillPage(props: { params: Promise<{ skillId: string }>}) {
    const { skillId } = await props.params
    if(!validateUUID(skillId)) throw new Error(`Invalid skillId (${skillId}) in path`)

    const skill = await prisma.skill.findUnique({
        include: {
            skillGroup: true,
            package: true,
        },
        where: { id: skillId }
    })

    if(!skill) return <NotFound/>

    return <AppPage
        label={skill.name}
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Skills", href: Paths.skillsList }]}
    >
        <PageHeader>
            <PageTitle objectType="Skill">{skill.name}</PageTitle>
        </PageHeader>
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>RT+ ID</DLTerm>
                        <DLDetails>{skill.id}</DLDetails>

                        <DLTerm>Name</DLTerm>
                        <DLDetails>{skill.name}</DLDetails>

                        <DLTerm>Description</DLTerm>
                        <DLDetails>{skill.description}</DLDetails>

                        <DLTerm>Frequency</DLTerm>
                        <DLDetails>{skill.frequency}</DLDetails>
                        
                        <DLTerm>Optional</DLTerm>
                        <DLDetails>{skill.optional ? 'Yes' : 'No'}</DLDetails>

                        <DLTerm>Package</DLTerm>
                        <DLDetails>
                            <Link href={Paths.skillPackage(skill.package.id)}>{skill.package.name}</Link>
                        </DLDetails>

                        <DLTerm>Skill Group</DLTerm>
                        <DLDetails>
                            {skill.skillGroup?.name ? <Link href={Paths.skillGroup(skill.skillGroup.id)}>{skill.skillGroup.name}</Link> : 'None'}
                        </DLDetails>
                    </DL>
                </CardContent>
            </Card>
        </CardGrid>
    </AppPage>
}