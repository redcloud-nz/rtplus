/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useOrganizationList, useUser } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import { isSandboxTeam, isSpecialTeam, isSystemTeam} from '@/lib/schemas/team'
import * as Paths from '@/paths'

export function TeamSwitcher() {

    const queryClient = useQueryClient()
    const router = useRouter()

    const { user } = useUser()
    const { isLoaded, setActive, userInvitations, userMemberships } = useOrganizationList({
        userMemberships: {
            keepPreviousData: true,
            infinite: true
        },
        userInvitations: {
            keepPreviousData: true,
            infinite: true
        }
    })

    const memberships = userMemberships.data || []
    const regularTeams = memberships.filter(membership => !isSpecialTeam(membership.organization.publicMetadata.teamId))
    const systemTeam = memberships.find(membership => isSystemTeam(membership.organization.publicMetadata.teamId))
    const sandboxTeams = memberships.filter(membership => isSandboxTeam(membership.organization.publicMetadata.teamId))

    const invitations = userInvitations.data || []

    async function handleSwitchTeam(organization: typeof memberships[0]['organization']) {
        setActive?.({ organization: organization.id })

        queryClient.clear()

        if(organization.slug == 'system') {
            router.push(Paths.system.href)
        } else {
            router.push(Paths.team(organization.slug!).href)
        }
    }

    async function handleSwitchToPersonalAccount() {
        setActive?.({ organization: null })

        queryClient.clear()

        router.push(Paths.personal.index)
    }

    async function handleAcceptInvitation(invitation: typeof invitations[0]) {
        await invitation.accept()

        queryClient.clear()
        router.push(Paths.team(invitation.publicOrganizationData.slug!).href)
    }

    return <div className="w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2">Select Team</h2>
        <p className="mb-4">Select a team to use:</p>
        <Show when={isLoaded}>
            <ul className="w-full space-y-2 mb-8">
                <AccountItem
                    imageUrl={user?.imageUrl ?? ""}
                    name={user?.fullName ?? ""}
                    onSwitchTeam={handleSwitchToPersonalAccount}
                />
                {systemTeam && (
                    <AccountItem
                        imageUrl={systemTeam.organization.imageUrl || ""}
                        name={systemTeam.organization.name}
                        onSwitchTeam={() => handleSwitchTeam(systemTeam.organization)}
                    />
                )}
            </ul>

            <Show when={regularTeams.length > 0}>
                <div className="w-full mb-8">
                    <h3 className="text-lg font-semibold mb-2">Regular Teams</h3>
                    <ul className="space-y-2">
                        {regularTeams
                            ?.sort((a, b) => a.organization.name.localeCompare(b.organization.name))
                            ?.map((membership) => <AccountItem
                                key={membership.id}
                                imageUrl={membership.organization.imageUrl || ""}
                                name={membership.organization.name}
                                role={membership.role == 'org:admin' ? 'Admin' : 'Member'}
                                onSwitchTeam={() => handleSwitchTeam(membership.organization)}
                            />)
                        }
                    </ul>
                </div>
            </Show>
            <Show when={invitations.length > 0}>
                <div className="w-full mb-8">
                    <h3 className="text-lg font-semibold mb-2">Invitations</h3>
                    <ul className="space-y-2">
                        {invitations
                            ?.sort((a, b) => a.publicOrganizationData.name.localeCompare(b.publicOrganizationData.name))
                            ?.map((invitation) => <InvitationItem
                                key={invitation.id}
                                imageUrl={invitation.publicOrganizationData.imageUrl || ""}
                                name={invitation.publicOrganizationData.name}
                                role={invitation.role == 'org:admin' ? 'Admin' : 'Member'}
                                onAccept={() => handleAcceptInvitation(invitation)}
                            />)
                        }
                    </ul>
                </div>
            </Show>
            <Show when={sandboxTeams.length > 0}>
                <div className="w-full mb-8">
                    <h3 className="text-lg font-semibold mb-2">Sandbox Teams</h3>
                    <ul className="space-y-2">
                        {sandboxTeams
                            ?.sort((a, b) => a.organization.name.localeCompare(b.organization.name))
                            ?.map((membership) => <AccountItem
                            key={membership.id}
                            imageUrl={membership.organization.imageUrl || ""}
                            name={membership.organization.name}
                            role={membership.role == 'org:admin' ? 'Admin' : 'Member'}
                            onSwitchTeam={() => handleSwitchTeam(membership.organization)}
                        />)
                    }
                    </ul>
                </div>
               
            </Show>
        </Show>
    </div>
}


interface AccountItemProps {
    imageUrl: string
    name: string
    role?: string
    onSwitchTeam: () => void
}

function AccountItem({ imageUrl, name, role, onSwitchTeam }: AccountItemProps) {

    return <li 
        className="w-fullbg-white rounded-sm shadow-md border"
    >
        <div className="group relative px-4 py-2 flex items-center gap-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-50">
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={imageUrl} alt={name} />
                <AvatarFallback className="rounded-lg">
                    {"T"}
                </AvatarFallback>
            </Avatar>
            <div className="grow-1">
                <h3 className="text-base font-semibold text-gray-900">
                    <button onClick={onSwitchTeam} className="focus:outline-hidden">
                        <span aria-hidden="true" className="absolute inset-0"/>
                        {name}
                    </button>
                    
                </h3>
                <div className="text-base text-gray-500">{role}</div>
            </div>
            <ArrowRight className="pointer-events-none text-gray-300 group-hover:text-gray-400"/>
        </div>
    </li>

}

interface InvitationItemProps {
    imageUrl: string
    name: string
    role?: string
    onAccept: () => void
}


function InvitationItem({ imageUrl, name, role, onAccept }: InvitationItemProps) {
    return <li 
        className="w-fullbg-white rounded-sm shadow-md border"
    >
        <div className="group relative px-4 py-2 flex items-center gap-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-50">
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={imageUrl} alt={name} />
                <AvatarFallback className="rounded-lg">
                    {"T"}
                </AvatarFallback>
            </Avatar>
            <div className="grow-1">
                <h3 className="text-base font-semibold text-gray-900">
                    {name}
                </h3>
                <div className="text-base text-gray-500">{role}</div>
            </div>
            <Button onClick={onAccept}>Join</Button>
        </div>
    </li>
}