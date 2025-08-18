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

import { isSandboxTeam, isSpecialTeam, isSystemTeam} from '@/lib/id'
import * as Paths from '@/paths'



export function TeamSwitcher() {
    const queryClient = useQueryClient()
    const router = useRouter()

    const { user } = useUser()
    const { isLoaded, setActive, userMemberships } = useOrganizationList({
        userMemberships: {
            keepPreviousData: true,
            infinite: true
        }
    })

    const memberships = userMemberships.data || []
    const regularTeams = memberships.filter(membership => !isSpecialTeam(membership.organization.publicMetadata.teamId))
    const systemTeam = memberships.find(membership => isSystemTeam(membership.organization.publicMetadata.teamId))
    const sandboxTeams = memberships.filter(membership => isSandboxTeam(membership.organization.publicMetadata.teamId))

    async function handleSwitchTeam(organizationId: string | null, orgSlug?: string) {
        setActive?.({ organization: organizationId })

        queryClient.clear()
        
        if(orgSlug == 'system') {
            router.push(Paths.system.href)
        } else if(organizationId ) {

            router.push(Paths.team(orgSlug!).href)
        } else {
            router.push(Paths.personal.index)
        }
    }

    


    return <div className="w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2">Select Team</h2>
        <p className="mb-4">Select a team to use:</p>
        <Show when={isLoaded}>
            <ul className="w-full space-y-2 mb-8">
                <AccountItem
                    imageUrl={user?.imageUrl ?? ""}
                    name={user?.fullName ?? ""}
                    onSwitchTeam={() => handleSwitchTeam(null)}
                />
                {systemTeam && (
                    <AccountItem
                        imageUrl={systemTeam.organization.imageUrl || ""}
                        name={systemTeam.organization.name}
                        onSwitchTeam={() => handleSwitchTeam(systemTeam.organization.id, 'system')}
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
                                key={membership.organization.id}
                                imageUrl={membership.organization.imageUrl || ""}
                                name={membership.organization.name}
                                role={membership.role == 'org:admin' ? 'Admin' : 'Member'}
                                onSwitchTeam={() => handleSwitchTeam(membership.organization.id, membership.organization.slug!)}
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
                            key={membership.organization.id}
                            imageUrl={membership.organization.imageUrl || ""}
                            name={membership.organization.name}
                            role={membership.role == 'org:admin' ? 'Admin' : 'Member'}
                            onSwitchTeam={() => handleSwitchTeam(membership.organization.id, membership.organization.slug!)}
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
