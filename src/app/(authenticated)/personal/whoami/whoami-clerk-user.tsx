/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { Fragment } from 'react'

import { useUser } from '@clerk/nextjs'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'



export function Whoami_ClerkUser_Card() {

    const { user } = useUser()


    return user ? <Card>
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
                        <DLDetails className="overflow-auto">
                            <pre className="font-mono text-sm">
                                <code>
                                    {JSON.stringify(user.publicMetadata, null, 2)}
                                </code>
                            </pre>
                        </DLDetails>

                        {user.externalAccounts.map((account) => <Fragment key={account.id}>
                            <DLTerm>{account.provider}</DLTerm>
                            <DLDetails>{account.providerTitle()}</DLDetails>
                        </Fragment>)}

                    </DL>
                </CardContent>
            </Card> : null
}