/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/personnel/[personId]/access
 */

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'
import { CardBoundary, CardGrid } from '@/components/ui/card'


import * as Paths from '@/paths'
import { HydrateClient, trpc } from '@/trpc/server'

import { MissingUserAlert } from './missing-user-alert'
import { PersonAccessCard } from './user-access-card'
import { UserPermissionsCard } from './user-permissions-card'



type Props = { params: Promise<{ personId: string }> }

export async function generateMetadata({ params }: Props) {
    const { personId } = await params

    const person = await trpc.personnel.byId({ personId })

    return person ? { title: `Access & Permissions | ${person.name}` } : { title: "Person Not Found" }
}


export default async function PersonAccessPage(props: Props) {
    const { personId } = await props.params

    

    const [person, user] = await Promise.all([  
        trpc.personnel.byId({ personId }),
        trpc.users.byPersonId({ personId })
    ])
    if(!person) return <NotFound/>

    if(user) void trpc.permissions.user.prefetch({ userId: user.id })

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

        { user 
            ? <HydrateClient>
                <CardGrid>
                    <CardBoundary>
                        <PersonAccessCard person={person}/>
                    </CardBoundary>
                    <CardBoundary>
                        <UserPermissionsCard userId={user?.id}/>
                    </CardBoundary>
                </CardGrid>
            </HydrateClient>
            : <MissingUserAlert person={person}/>
        }
    </AppPage>
}