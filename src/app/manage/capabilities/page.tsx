

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import Alert from '@/components/ui/alert'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'

import * as Paths from '@/paths'


export default async function CapabilitiesListPage() {

    const capabilites = await prisma.capability.findMany({})

    return <AppPage
        label="Capabilities" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    >
        <PageHeader>
            <PageTitle>Manage Capabilities</PageTitle>
            <PageDescription>Manage the capabilities available in RT+.</PageDescription>
        </PageHeader>
        <Show
            when={capabilites.length > 0}
            fallback={<Alert severity="info" title="No capabilites defined."/>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Name</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {capabilites.map(capability =>
                        <TableRow key={capability.id}>
                            <TableCell>
                                <Link href={Paths.capability(capability.ref || capability.id)}>{capability.name}</Link>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>
}