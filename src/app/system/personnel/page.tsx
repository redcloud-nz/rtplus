/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel
 */

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'


import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/server/prisma'
import * as Paths from '@/paths'
import { Protect } from '@clerk/nextjs'

export const metadata: Metadata = { title: "Teams" }

export default async function PeopleListPage() {

    const people = await prisma.person.findMany({
        orderBy: { name: 'asc' }
    })

    return <AppPage
        label="Personnel" 
        breadcrumbs={[{ label: "Manage", href: Paths.system }]}
    >
        <PageHeader>
            <PageTitle>Manage People</PageTitle>
            <PageDescription>These are the people that available for use in RT+.</PageDescription>
            <PageControls>
                <Protect role="org:admin">
                    <Button asChild>
                        <Link href={Paths.newPerson}>
                            <PlusIcon/> New Person
                        </Link>
                    </Button>
                </Protect>
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