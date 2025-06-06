/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel/[person_id]
 */

import { EllipsisVerticalIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'

import * as Paths from '@/paths'
import prisma from '@/server/prisma'
import { HydrateClient } from '@/trpc/server'

import { PersonDetailsCard } from './person-details'
import { PersonMenu } from './person-menu'
import { TeamMembershipsCard } from './team-memberships'



interface PersonPageProps {
    params: Promise<{ person_id: string }>
}

const getPerson = cache(async (personId: string) => prisma.person.findUnique({ where: { id: personId }}))


export async function generateMetadata({ params }: PersonPageProps) {
    const {person_id: personId } = await params
    
    const person = await getPerson(personId)
    if(!person) notFound()

    return { title: `${person.name} | Personnel` }
}


export default async function PersonPage(props: PersonPageProps) {
    const { person_id: personId } = await props.params

    const person = await getPerson(personId)
    if(!person) notFound()

    return <AppPage>
        <AppPageBreadcrumbs
            label={person.name}
            breadcrumbs={[
                { label: "System", href: Paths.system.index }, 
                { label: "Personnel", href: Paths.system.personnel.index }
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Person">{person.name}</PageTitle>
                    <PageControls>
                        <PersonMenu 
                            personId={personId} 
                            trigger={<DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Person options">
                                <EllipsisVerticalIcon/>
                            </DropdownMenuTriggerButton>}
                        />
                    </PageControls>
                </PageHeader>

                <PersonDetailsCard personId={personId}/>
                <TeamMembershipsCard personId={personId}/>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}