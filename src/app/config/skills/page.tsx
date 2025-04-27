/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/skills
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/server/prisma'

import * as Paths from '@/paths'

export default async function SkillListPage() {

    const skills = await prisma.skill.findMany({
        orderBy: { name: 'asc' },
        include: { skillGroup: true, skillPackage: true }
    })

    return <AppPage
       
    >
        <AppPageBreadcrumbs
             label="Skills"
             breadcrumbs={[{ label: "Configure", href: Paths.config.index }]}
        />
        <AppPageContent>
            <PageHeader>
                <PageTitle>Manage Skills</PageTitle>
                <PageDescription>Manage the skills available in RT+.</PageDescription>
            </PageHeader>
            <Show
                when={skills.length > 0}
                fallback={<Alert severity="info" title="No skills defined."/>}
            >
                <Table border>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell className="w-1/3">Name</TableHeadCell>
                            <TableHeadCell className="w-1/3">Package</TableHeadCell>
                            <TableHeadCell className="w-1/3">Skill Group</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {skills.map(skill => 
                            <TableRow key={skill.id}>
                                <TableCell>
                                    <Link href={Paths.config.skills.skill(skill.id).index}>{skill.name}</Link>
                                </TableCell>
                                <TableCell>{skill.skillPackage.name}</TableCell>
                                <TableCell>{skill.skillGroup?.name}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Show>
        </AppPageContent>
    </AppPage>
}