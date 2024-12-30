/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /account/whoami
 */

import { auth, currentUser } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Unauthorized } from '@/components/errors'

import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import prisma from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'


export default async function WhoAmIPage() {

    const { orgId } = await auth()

    const user = await currentUser()
    if(!user) return <Unauthorized label="Who am I?"/>

    const person = user.publicMetadata.personId
        ? await prisma.person.findFirst({
            where: {
                id: user.publicMetadata.personId
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

                        <DLTerm>Clerk Org ID</DLTerm>
                        <DLDetails>{orgId}</DLDetails>

                        <DLTerm>{`user.publicMetadata.personId`}</DLTerm>
                        <DLDetails>{''+user.publicMetadata.personId}</DLDetails>
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

                        <DLTerm></DLTerm>
                        
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
        </CardGrid>
    </AppPage>
}