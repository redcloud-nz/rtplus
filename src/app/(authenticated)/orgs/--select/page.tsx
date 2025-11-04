/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/--select
 */
'use client'

import { ChevronRightIcon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Fragment } from 'react'

import { useOrganizationList, useUser } from '@clerk/nextjs'

import { Lexington } from '@/components/blocks/lexington'
import { Show } from '@/components/show'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { S2_Button } from '@/components/ui/s2-button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from '@/components/ui/items'
import { Link } from '@/components/ui/link'
import { PageLoadingSpinner } from '@/components/ui/loading'

import { getUserInitials } from '@/lib/utils'
import * as Paths from '@/paths'



export default function SelectOrganization_Page() {

    const router = useRouter()

    const { user } = useUser()
    const { isLoaded, userInvitations, userMemberships } = useOrganizationList({ userInvitations: { pageSize: 100, status: 'pending' }, userMemberships: { pageSize: 100 }})

    const fullName = user?.fullName || ""
    const initials = getUserInitials(fullName)
    const memberships = userMemberships.data || []
    const invitations = userInvitations.data || []

    async function handleAcceptInvitation(invitation: typeof invitations[number]) {
        await invitation.accept()

        router.push(Paths.org(invitation.publicOrganizationData.slug!).dashboard.href)
    }

    return <Lexington.Root>
            <Lexington.Header
                breadcrumbs={["Select Organization"]}
                sidebarTrigger={false}
            />
            <Show 
                when={isLoaded}
                fallback={<PageLoadingSpinner />}
            >
                <Lexington.Page variant="container-md">
                    <div className="flex-col gap-4 mt-12">
                        <div className="text-center">
                            <h3 className="text-md font-medium">Select an account</h3>
                            <p className="text-sm text-muted-foreground">to continue to RT+</p>
                        </div>
                        
                        <ItemGroup>
                            <Item asChild>
                                <Link to={Paths.personal.dashboard}>
                                    <ItemMedia>
                                        <Avatar className="rounded-full">
                                            <AvatarImage src={user?.imageUrl} alt={fullName} />
                                            <AvatarFallback className="rounded-full">{initials}</AvatarFallback>
                                        </Avatar>
                                    </ItemMedia>
                                    <ItemContent className="gap-1">
                                        <ItemTitle>Personal Account</ItemTitle>
                                    </ItemContent>
                                    <ItemActions>
                                        <ChevronRightIcon className="size-4" />
                                    </ItemActions>
                                </Link>
                            </Item>
                            <ItemSeparator />
                            
                            {memberships.map((membership) => <Fragment key={membership.id}>
                                <Item asChild>
                                    <Link to={Paths.org(membership.organization.slug!).dashboard}>
                                        <ItemMedia>
                                            <Avatar>
                                                <AvatarImage src={membership.organization.imageUrl} alt={membership.organization.name || 'Organization Avatar'} />
                                                <AvatarFallback>{membership.organization.name[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </ItemMedia>
                                        <ItemContent className="gap-1">
                                            <ItemTitle>{membership.organization.name}</ItemTitle>
                                        </ItemContent>
                                        <ItemActions>
                                            <ChevronRightIcon className="size-4" />
                                        </ItemActions>
                                    </Link>
                                </Item>
                                <ItemSeparator />
                            </Fragment>)}
                            {invitations.map((invitation) => <Fragment key={invitation.id}>
                                <Item>
                                    <ItemMedia>
                                        <Avatar>
                                            <AvatarImage src={invitation.publicOrganizationData.imageUrl} alt={invitation.publicOrganizationData.name || 'Organization Avatar'} />
                                            <AvatarFallback>{invitation.publicOrganizationData.name[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </ItemMedia>
                                    <ItemContent className="gap-1">
                                        <ItemTitle>{invitation.publicOrganizationData.name}</ItemTitle>
                                        <ItemDescription>You have been invited to join this organization.</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <S2_Button variant="outline" onClick={() => handleAcceptInvitation(invitation)}>Join</S2_Button>
                                    </ItemActions>
                                </Item>
                                <ItemSeparator />
                            </Fragment>)}
                            <Item asChild>
                                <Link to={Paths.orgs.create}>
                                    <ItemMedia>
                                        <Avatar>
                                            <AvatarImage src={undefined} alt="Organization Avatar" />
                                            <AvatarFallback><PlusIcon/></AvatarFallback>
                                        </Avatar>
                                    </ItemMedia>
                                    <ItemContent className="gap-1">
                                        <ItemTitle className="text-foreground/80">Create organization</ItemTitle>
                                    </ItemContent>
                                </Link>
                            </Item>
                        </ItemGroup>
                    </div>
                </Lexington.Page>
            </Show>
            
        </Lexington.Root>
}