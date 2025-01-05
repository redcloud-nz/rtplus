/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/skills/[skillIdOrRef]
 */

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import prisma from '@/lib/prisma'

import * as Paths from '@/paths'

export default async function SkillPage(props: { params: Promise<{ skillIdOrRef: string }>}) {
    const params = await props.params;

    const skill = await prisma.skill.findFirst({
        include: {
            skillGroup: true,
            package: true,
        },
        where: {
            OR: [
                { id: params.skillIdOrRef },
                { ref: params.skillIdOrRef }
            ]
        }
    })

    if(!skill) return <NotFound/>

    return <AppPage
        label={skill.ref || skill.name}
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Skills", href: Paths.skillsAll }]}
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

                        <DLTerm>Ref</DLTerm>
                        <DLDetails>{skill.ref}</DLDetails>

                        <DLTerm>Description</DLTerm>
                        <DLDetails>{skill.description}</DLDetails>

                        <DLTerm>Frequency</DLTerm>
                        <DLDetails>{skill.frequency}</DLDetails>
                        
                        <DLTerm>Optional</DLTerm>
                        <DLDetails>{skill.optional ? 'Yes' : 'No'}</DLDetails>

                        <DLTerm>Package</DLTerm>
                        <DLDetails>{skill.package.name}</DLDetails>

                        <DLTerm>Skill Group</DLTerm>
                        <DLDetails>{skill.skillGroup?.name ?? "None"}</DLDetails>
                    </DL>
                </CardContent>
            </Card>
        </CardGrid>
    </AppPage>
}