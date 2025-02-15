/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /configure/personnel/[personId]/access
 */

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'


import * as Paths from '@/paths'
import { HydrateClient, trpc } from '@/trpc/server'

import { AddPermissionDialog } from './add-permission'
import { PermissionList } from './permission-list'




type Props = { params: Promise<{ personId: string }> }

export async function generateMetadata({ params }: Props) {
    const { personId } = await params

    const person = await trpc.personnel.byId({ personId })

    return person ? { title: `Access & Permissions | ${person.name}` } : { title: "Person Not Found" }
}


export default async function PersonAccessPage(props: Props) {
    const { personId } = await props.params

    void trpc.permissions.person.prefetch({ personId })

    const person = await trpc.personnel.byId({ personId })
    if(!person) return <NotFound/>

    return <AppPage
        label="Access & Permissions"
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index }, 
            { label: "Personnel", href: Paths.config.personnel.index },
            { label: person.name, href: Paths.config.personnel.person(personId).index }
        ]}
    >
        <PageHeader>
            <PageTitle>RT+ Permissions</PageTitle>
            <PageDescription>Manage the access and permissions for {person.name}.</PageDescription>
        </PageHeader>

        <HydrateClient>
            <CardGrid>
                <Card>
                    <CardHeader>
                        <CardTitle>Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                        
                    </CardContent>
                </Card>
                <Card boundary>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <AddPermissionDialog personId={personId}/>
                    </CardHeader>
                    <CardContent>
                        <PermissionList personId={personId}/>
                    </CardContent>
                </Card>
            </CardGrid>
        </HydrateClient>

        
    </AppPage>
}