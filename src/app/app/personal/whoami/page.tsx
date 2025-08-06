/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal/whoami
 */

import { Metadata } from 'next'

import { auth, currentUser } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import * as Paths from '@/paths'
import prisma from '@/server/prisma'



export const metadata: Metadata = {
    title: "Who am I?"
}

export default async function WhoAmIPage() {

    const { sessionClaims } = await auth.protect()
    const clerkUser = (await currentUser())!

    const personId = sessionClaims.rt_person_id

    const person = personId
        ? await prisma.person.findUnique({
            where: { id: personId }
        })
        : null

    return <AppPage>
        <AppPageBreadcrumbs
            label="Who am I?"
            breadcrumbs={[{ label: "Personal", href: Paths.personal.index }]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Who am I?</PageTitle>
                <PageDescription>Data connected to your user session.</PageDescription>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Clerk</CardTitle>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>Clerk User ID</DLTerm>
                        <DLDetails>{clerkUser.id}</DLDetails>

                        {clerkUser.fullName && <>
                            <DLTerm>Full Name</DLTerm>
                            <DLDetails>{clerkUser.fullName}</DLDetails>
                        </>}
                        {clerkUser.primaryEmailAddress && <>
                            <DLTerm>Primary Email Address</DLTerm>
                            <DLDetails>{clerkUser.primaryEmailAddress.emailAddress}</DLDetails>
                        </>}
                        {clerkUser.primaryPhoneNumber && <>
                            <DLTerm>Primary Phone Number</DLTerm>
                            <DLDetails>{clerkUser.primaryPhoneNumber.phoneNumber}</DLDetails>
                        </>}

                        <DLTerm>Public Metadata</DLTerm>
                        <DLDetails className="overflow-auto">
                            <pre className="font-mono text-sm">
                                <code>
                                    {JSON.stringify(clerkUser.publicMetadata, null, 2)}
                                </code>
                            </pre>
                        </DLDetails>
                        
                    </DL>
                </CardContent>
            </Card>
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

                            <DLTerm>Onboarding Status</DLTerm>
                            <DLDetails>REMOVED</DLDetails>

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