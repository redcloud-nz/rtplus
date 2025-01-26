/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /account/whoami
 */

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import { authenticated } from '@/lib/server/auth'
import prisma from '@/lib/server/prisma'
import { formatDateTime } from '@/lib/utils'



export default async function WhoAmIPage() {

    const { userPersonId } = await authenticated()
    const user = (await currentUser())!

    const person = userPersonId
        ? await prisma.person.findUnique({
            where: {
                id: userPersonId
            }
        })
        : null

    return <AppPage
        label="Who am I?"
    >
        <PageHeader>
            <PageTitle>Who am I?</PageTitle>
            <PageDescription>Data connected to your user session.</PageDescription>
        </PageHeader>
        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Clerk</CardTitle>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>Clerk User ID</DLTerm>
                        <DLDetails>{user.id}</DLDetails>

                        {user.fullName && <>
                            <DLTerm>Full Name</DLTerm>
                            <DLDetails>{user.fullName}</DLDetails>
                        </>}
                        {user.primaryEmailAddress && <>
                            <DLTerm>Primary Email Address</DLTerm>
                            <DLDetails>{user.primaryEmailAddress.emailAddress}</DLDetails>
                        </>}
                        {user.primaryPhoneNumber && <>
                            <DLTerm>Primary Phone Number</DLTerm>
                            <DLDetails>{user.primaryPhoneNumber.phoneNumber}</DLDetails>
                        </>}

                        <DLTerm>Public Metadata</DLTerm>
                        
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

                            <DLTerm>Created</DLTerm>
                            <DLDetails>{formatDateTime(person.createdAt)}</DLDetails>

                            <DLTerm>Updated</DLTerm>
                            <DLDetails>{formatDateTime(person.updatedAt)}</DLDetails>
                        </DL>
                        : <Alert severity="warning" title="No matching person found."/>
                    }
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Public Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre>
                        <code>
                            {JSON.stringify(user.publicMetadata, null, 2)}
                        </code>
                    </pre>
                </CardContent>
            </Card>
        </CardGrid>
    </AppPage>
}