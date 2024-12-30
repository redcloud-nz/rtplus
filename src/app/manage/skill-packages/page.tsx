

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'

import * as Paths from '@/paths'


export default async function CapabilitiesListPage() {

    const packages = await prisma.skillPackage.findMany({})

    return <AppPage
        label="Skill Packages" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    >
        <PageHeader>
            <PageTitle>Manage Skill Packages</PageTitle>
            <PageDescription>Manage the skill packages available in RT+.</PageDescription>
        </PageHeader>
        <Show
            when={packages.length > 0}
            fallback={<Alert severity="info" title="No skill packages defined."/>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Name</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {packages.map(capability =>
                        <TableRow key={capability.id}>
                            <TableCell>
                                <Link href={Paths.skillPackage(capability.ref || capability.id)}>{capability.name}</Link>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>
}