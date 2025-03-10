// /manage/teams

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'

import { auth } from '@clerk/nextjs/server'

import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import Alert from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Link } from '@/components//ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import * as Paths from '@/paths'
import { Protect } from '@clerk/nextjs'

export const metadata: Metadata = { title: "Teams | RT+" }

export default async function TeamsPage() {

    const { orgId } = await auth.protect()

    const teams = await prisma.team.findMany({
        where: { orgId },
        include: {
            _count: {
                select: { memberships: true }
            }
        }
    })
    
    return <AppPage 
        label="Teams"
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    >
        <PageHeader>
            <PageTitle>Manage Teams</PageTitle>
            <PageDescription>These are the teams that are available for use in RT+.</PageDescription>
            <PageControls>
                <Protect role="org:admin">
                    <Button asChild>
                        <Link href={Paths.newTeam}>
                            <PlusIcon/> New Team
                        </Link>
                    </Button>
                </Protect>
            </PageControls>
        </PageHeader>
        <Show
            when={teams.length > 0}
            fallback={<Alert severity="info" title="No teams defined.">Add a team to get started.</Alert>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Code</TableHeadCell>
                        <TableHeadCell className="text-center">Colour</TableHeadCell>
                        <TableHeadCell className='text-center'>Members</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {teams.map(team => 
                        <TableRow key={team.id}>
                            <TableCell>
                                <Link href={Paths.team(team.ref || team.id)}>{team.name}</Link>
                            </TableCell>
                            <TableCell>{team.ref}</TableCell>
                            <TableCell className='text-center'>{team.color}</TableCell>
                            <TableCell className='text-center'>{team._count.memberships}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>

}