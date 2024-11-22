// /profile/d4h-access-keys

import { PlusIcon, TrashIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Unauthorized } from '@/components/errors'
import { Show } from '@/components/show'

import Alert from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import prisma from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import * as Paths from '@/paths'

import { EnabledSwitch } from './enabled-switch'
import { DeleteAccessKeyDialog } from './delete-access-key'
import { NewAccessKeyDialog } from './new-access-key'


export const metadata: Metadata = { title: "Personal D4H Access Keys | RT+" }

export default async function D4hAccessKeysPage() {
    
    const user = await currentUser()
    if(!user) return <Unauthorized label="D4H Access Keys"/>
   
    const accessKeys = await prisma.d4hAccessKey.findMany({
        select: {
            id: true,
            key: true,
            createdAt: true,
            enabled: true,
            team: {
                select: { name: true }
            }
        },
        where: { personId: user.publicMetadata.personId }
    })

    const teams = await prisma.team.findMany({})

    return <AppPage 
        label="D4H Access Keys" 
        breadcrumbs={[{ label: "User Profile", href: Paths.profile }]}
    >
        <PageHeader>
            <PageTitle>Personal D4H Access Keys</PageTitle>
            <PageDescription>
                A list of the personal D4H access keys that you have configured.
            </PageDescription>
            <PageControls>
                <NewAccessKeyDialog teams={teams}>
                    <Button><PlusIcon/> Add Key</Button>
                </NewAccessKeyDialog>
            </PageControls>
        </PageHeader>
        <Show
            when={accessKeys.length > 0}
            fallback={<Alert severity="info" title="No personal access keys defined.">
                Generate a key at: <span className="ml-2 font-mono">D4H Team Manager &gt; My Settings &gt; API Access Keys</span>
            </Alert>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Team</TableHeadCell>
                        <TableHeadCell>Created At</TableHeadCell>
                        <TableHeadCell className="text-center">Enabled</TableHeadCell>
                        <TableHeadCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {accessKeys.sort((a, b) => a.team.name.localeCompare(b.team.name)).map(accessKey =>
                        <TableRow key={accessKey.id}>
                            <TableCell>{accessKey.team.name}</TableCell>
                            <TableCell>{formatDateTime(accessKey.createdAt)}</TableCell>
                            <TableCell className="text-center">
                                <EnabledSwitch accessKeyId={accessKey.id} defaultChecked={accessKey.enabled}/>
                            </TableCell>
                            <TableCell className="text-right">
                                <DeleteAccessKeyDialog accessKeyId={accessKey.id} teamName={accessKey.team.name}>
                                    <Button variant="ghost">
                                        <TrashIcon/>
                                    </Button>
                                </DeleteAccessKeyDialog>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>
    </AppPage>
}

 


