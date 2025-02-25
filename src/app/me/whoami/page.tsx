/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /account/whoami
 */

import { Metadata } from 'next'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import { authenticated } from '@/server/auth'
import prisma from '@/server/prisma'



export const metadata: Metadata = {
    title: "Who am I?"
}

export default async function WhoAmIPage() {

    const { userId, userPersonId } = await authenticated()
    const clerkUser = (await currentUser())!

    const person = userPersonId
        ? await prisma.person.findUnique({
            where: {
                id: userPersonId
            }
        })
        : null

    const user = userId
        ? await prisma.user.findUnique({
            where: {
                id: userId
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
                        
                    </DL>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Public Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="font-mono text-sm">
                        <code>
                            {JSON.stringify(clerkUser.publicMetadata, null, 2)}
                        </code>
                    </pre>
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
                        </DL>
                        : <Alert severity="warning" title="No matching person found."/>
                    }
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>User</CardTitle>
                </CardHeader>
                <CardContent>
                    {user
                        ? <DL>
                            <DLTerm>User ID</DLTerm>
                            <DLDetails>{user.id}</DLDetails>
                            
                            <DLTerm>User name</DLTerm>
                            <DLDetails>{user.name}</DLDetails>

                            <DLTerm>Email</DLTerm>
                            <DLDetails>{user.email}</DLDetails>
                        </DL>
                        : <Alert severity="warning" title="No matching user found."/>
                    }
                </CardContent>
            </Card>
        </CardGrid>
    </AppPage>
}