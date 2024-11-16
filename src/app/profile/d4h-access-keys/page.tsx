// /settings/d4h-access-keys

import { Metadata } from 'next'
import React from 'react'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'
import { Unauthorized } from '@/components/errors'

import Alert from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'

import { DeleteAccessKeyButton } from './delete-access-key'
import { NewAccessKeyButton } from './new-access-key'
import { UpdateAccessKeyButton } from './update-access-key'


export const metadata: Metadata = { title: "D4H Access Keys | RT+" }

export default async function D4hAccessKeysPage() {
    
   const user = await currentUser()
   if(!user) return <Unauthorized label="D4H Access Keys"/>
   
   const accessKeys = await prisma.d4hAccessKey.findMany({ where: { userId: user.id } })

    return <AppPage 
        label="D4H Access Keys" 
        breadcrumbs={[{ label: "User Settings", href: "/user" }]}
        variant="list"
    >
        <PageTitle>Personal D4H Access Keys</PageTitle>
        <PageDescription>
            A list of the personal D4H access keys that you have configured.
        </PageDescription>
        <div>
            <div className="mb-2 flex gap-2 justify-end">
                <NewAccessKeyButton/>
            </div>
            {accessKeys.length > 0
                ? <div className="rounded-md border">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell>Label</TableHeadCell>
                                <TableHeadCell>Team</TableHeadCell>
                                <TableHeadCell>Create At</TableHeadCell>
                                <TableHeadCell className="text-center">Primary</TableHeadCell>
                                <TableHeadCell className="text-center">Enabled</TableHeadCell>
                                <TableHeadCell/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {accessKeys.map(accessKey =>
                                <TableRow key={accessKey.id}>
                                    <TableCell>{accessKey.label}</TableCell>
                                    <TableCell>{accessKey.teamName}</TableCell>
                                    <TableCell>{formatDateTime(accessKey.createdAt)}</TableCell>
                                    <TableCell className="text-center">{accessKey.primary ? "YES" : null}</TableCell>
                                    <TableCell className="text-center">{accessKey.enabled ? "YES" : "NO"}</TableCell>
                                    <TableCell className="text-right">
                                        
                                        <UpdateAccessKeyButton accessKey={accessKey}/>
                                        <DeleteAccessKeyButton accessKey={accessKey}/>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                : <Alert severity="info" title="No personal access keys defined.">
                    Generate a key at: <span className="ml-2 font-mono">D4H Team Manager &gt; My Settings &gt; API Access Keys</span>
                </Alert>
            }
            
        </div>
    </AppPage>
}

 


