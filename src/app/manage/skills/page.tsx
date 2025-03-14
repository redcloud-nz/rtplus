
import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import Alert from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'

import * as Paths from '@/paths'

export default async function SkillListPage() {

    const skills = await prisma.skill.findMany({
        orderBy: { name: 'asc' },
        include: { skillGroup: true, package: true }
    })

    return <AppPage
        label="Skills"
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    >
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
                                <Link 
                                    href={Paths.skill(skill.ref || skill.id)}
                                >{skill.name}</Link>
                            </TableCell>
                            <TableCell>{skill.package.name}</TableCell>
                            <TableCell>{skill.skillGroup?.name}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>
}