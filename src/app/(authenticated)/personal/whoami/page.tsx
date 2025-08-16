/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal/whoami
 */

import { Metadata } from 'next'

import { auth} from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import * as Paths from '@/paths'
import prisma from '@/server/prisma'
import { Whoami_ClerkUser_Card } from './whoami-clerk-user'



export const metadata: Metadata = {
    title: "Who am I?"
}

export default async function Whoami_Page() {

    const { sessionClaims } = await auth.protect()

    const personId = sessionClaims.rt_person_id

    const person = personId
        ? await prisma.person.findUnique({
            where: { id: personId }
        })
        : null

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[Paths.personal, Paths.personal.whoami]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Who am I?</PageTitle>
                <PageDescription>Data connected to your user session.</PageDescription>
            </PageHeader>
            <Whoami_ClerkUser_Card/>
            <Card>
                <CardHeader>
                    <CardTitle>RT+ Person</CardTitle>
                </CardHeader>
                <CardContent>
                    {person
                        ? <DL>
                            <DLTerm>RT+ Person ID</DLTerm>
                            <DLDetails>{person.id}</DLDetails>

                            <DLTerm>Person name</DLTerm>
                            <DLDetails>{person.name}</DLDetails>
                            
                            <DLTerm>Email</DLTerm>
                            <DLDetails>{person.email}</DLDetails>


                            <DLTerm>Status</DLTerm>
                            <DLDetails>{person.status}</DLDetails>
                        </DL>
                        : <Alert severity="warning" title="No matching person found."/>
                    }
                </CardContent>
            </Card>
        </AppPageContent>
    </AppPage>
}