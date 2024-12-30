// /manage/people

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'


import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import * as Paths from '@/paths'

export const metadata: Metadata = { title: "Teams | RT+" }

export default async function PeopleListPage() {

    const people = await prisma.person.findMany({
        orderBy: { name: 'asc' }
    })

    return <AppPage
        label="People" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    >
        <PageHeader>
            <PageTitle>Manage People</PageTitle>
            <PageDescription>These are the people that available for use in RT+.</PageDescription>
            <PageControls>
                <Button asChild>
                    <Link href={Paths.newPerson}>
                        <PlusIcon/> New Person
                    </Link>
                </Button>
            </PageControls>
        </PageHeader>
        <Show 
            when={people.length > 0}
            fallback={<Alert severity="info" title="No people defined">Add some people to get started.</Alert>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell className="w-1/2">Name</TableHeadCell>
                        <TableHeadCell className="w-1/2">Email</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {people.map(person =>
                        <TableRow key={person.id}>
                            <TableCell>
                                <Link href={Paths.person(person.id)}>{person.name}</Link>
                            </TableCell>
                            <TableCell>{person.email}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>

  
}