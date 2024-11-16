// /manage/teams

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'
import { Unauthorized } from '@/components/errors'

import Alert from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Link } from '@/components//ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import { Paths } from '@/paths'


export const metadata: Metadata = { title: "Teams | RT+" }

export default async function TeamsPage() {

    const user = await currentUser()
    if(!user) return <Unauthorized label="Teams"/>

    const teams = await prisma.team.findMany({
        include: {
            _count: {
                select: { memberships: true }
            }
        }
    })
    
    return <AppPage 
        label="Teams"
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
        variant="list"
    >
        <PageTitle>Manage Teams</PageTitle>
        <PageDescription>Manage the teams available in RT+.</PageDescription>
        <div>
            <div className="mb-2 flex gap-2 justify-end">
                <Button asChild>
                    <Link href={Paths.newTeam}>
                        <PlusIcon/> New Team
                    </Link>
                    
                </Button>
            </div>
            {teams.length > 0
                ? <div className="rounded-md border">
                    <Table>
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
                                        <Link href={Paths.team(team.code || team.id)}>{team.name}</Link>
                                    </TableCell>
                                    <TableCell>{team.code}</TableCell>
                                    <TableCell className='text-center'>{team.color}</TableCell>
                                    <TableCell className='text-center'>{team._count.memberships}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                :<Alert severity="info" title="No teams defined.">
                    Add a team to get started.
                </Alert>
            }
        </div>
    </AppPage>

}