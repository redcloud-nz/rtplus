/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-groups
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/server/prisma'

import * as Paths from '@/paths'

export default async function SkillGroupListPage() {

    const skillGroups = await prisma.skillGroup.findMany({
        orderBy: { name: 'asc' },
        include: { skillPackage: true }
    })

    return <AppPage>
        <AppPageBreadcrumbs
            label="Skill Groups"
            breadcrumbs={[{ label: "System", href: Paths.system.index }]}
        />
        
        <AppPageContent>
            <PageHeader>
                <PageTitle>Manage Skill Groups</PageTitle>
                <PageDescription>Manage the skill groups available in RT+.</PageDescription>
            </PageHeader>
            <Show
                when={skillGroups.length > 0}
                fallback={<Alert severity="info" title="No skill groups defined."/>}
            >
                <Table border>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell className="w-1/2">Name</TableHeadCell>
                            <TableHeadCell className="w-1/2">Capability</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {skillGroups.map(skillGroup => 
                            <TableRow key={skillGroup.id}>
                                <TableCell>
                                    <Link 
                                        href={Paths.system.skillGroups.skillGroup(skillGroup.id).index}
                                    >{skillGroup.name}</Link>
                                </TableCell>
                                <TableCell>{skillGroup.skillPackage.name}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Show>
        </AppPageContent>
    </AppPage>
}