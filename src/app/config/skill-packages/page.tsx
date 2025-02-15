/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/skill-packages
 */

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/server/prisma'

import * as Paths from '@/paths'


export default async function SkillPackageListPage() {

    const skillPackages = await prisma.skillPackage.findMany({})

    return <AppPage
        label="Skill Packages" 
        breadcrumbs={[{ label: "Configre", href: Paths.config.index }]}
    >
        <PageHeader>
            <PageTitle>Manage Skill Packages</PageTitle>
            <PageDescription>Manage the skill packages available in RT+.</PageDescription>
        </PageHeader>
        <Show
            when={skillPackages.length > 0}
            fallback={<Alert severity="info" title="No skill packages defined."/>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Name</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {skillPackages.map(skillPackage =>
                        <TableRow key={skillPackage.id}>
                            <TableCell>
                                <Link href={Paths.config.skillPackages.skillPackage(skillPackage.id).index}>{skillPackage.name}</Link>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>
}