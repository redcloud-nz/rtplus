// /user/d4h-access-keys

import { Metadata } from 'next'
import React from 'react'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage } from '@/components/app-page'

import { Heading } from '@/components/ui/heading'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'

import { DeleteAccessKeyDialog } from './delete-access-key'
import { NewAccessKeyDialog } from './new-access-key'
import { UpdateAccessKeyDialog } from './update-access-key'




export const metadata: Metadata = { title: "D4H Access Keys | RT+" }

export default async function D4hAccessKeysPage() {
    
   const user = await currentUser()
   if(!user) throw new Error("Must be logged in to access this page.")
   
   const accessKeys = await prisma.d4hAccessKey.findMany({ where: { userId: user.id } })

    return <AppPage label="D4H Access Keys" breadcrumbs={[{ label: "User Settings", href: "/~" }]}>
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <Heading level={1}>Personal D4H Access Keys</Heading>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of the personal D4H access keys that you have configured.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <NewAccessKeyDialog/>
                </div>
            </div>
            <div className="rounded-md border">
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
                                    
                                    <UpdateAccessKeyDialog accessKey={accessKey}/>
                                    <DeleteAccessKeyDialog accessKey={accessKey}/>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    </AppPage>
}

 


