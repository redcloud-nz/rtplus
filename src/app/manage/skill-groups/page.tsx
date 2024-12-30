
import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'

import * as Paths from '@/paths'

export default async function SkillGroupListPage() {

    const skillGroups = await prisma.skillGroup.findMany({
        orderBy: { name: 'asc' },
        include: { package: true }
    })

    return <AppPage
        label="Skill Groups"
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    >
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
                                    href={Paths.skillGroup(skillGroup.ref || skillGroup.id)}
                                >{skillGroup.name}</Link>
                            </TableCell>
                            <TableCell>{skillGroup.package.name}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>
}