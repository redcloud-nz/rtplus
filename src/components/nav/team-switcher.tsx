/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useOrganizationList, useUser } from '@clerk/nextjs'

import { Show } from '@/components/show'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingOverlay } from '@/components/ui/loading'

import * as Paths from '@/paths'
import { getUserInitials, resolveAfter } from '@/lib/utils'




export function TeamSwitcher() {
    const router = useRouter()

    const [syncing, setSyncing] = useState(false)

    const { user } = useUser()
    const { isLoaded, setActive, userMemberships } = useOrganizationList({
        userMemberships: {
            keepPreviousData: true,
            infinite: true
        }
    })


    async function handleSwitchTeam(organizationId: string | null, orgSlug?: string) {
        setSyncing(true)
        setActive?.({ organization: organizationId })
        
        if(organizationId) {
            await resolveAfter(null, 2000)
        
            router.push(Paths.team(orgSlug!).index)
            setSyncing(false)
        } else {
            setSyncing(false)
            router.push(Paths.personal.index)
        }

        
    }

    return <div className="w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2">Select Team</h2>
        <p className="mb-4">Select a team to use:</p>
        <Show when={isLoaded}>
             <ul className="w-full space-y-2 mb-8">
                <li className="w-full bg-white rounded-sm shadow-md border">
                    <div className="group relative p-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-50">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ""} />
                            <AvatarFallback className="rounded-lg">
                                {getUserInitials(user?.fullName || "")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grow-1">
                            <h3 className="text-base font-semibold text-gray-900">
                                <button onClick={() => handleSwitchTeam(null)} className="focus:outline-hidden">
                                        <span aria-hidden="true" className="absolute inset-0"/>
                                {"Personal Account"}
                                </button>
                                
                            </h3>
                        </div>
                        <ArrowRight className="pointer-events-none text-gray-300 group-hover:text-gray-400"/>
                    </div>
                  </li>
                {userMemberships.data
                ?.sort((a, b) => a.organization.name.localeCompare(b.organization.name))
                ?.map((membership) => <li 
                    className="w-fullbg-white rounded-sm shadow-md border"
                    key={membership.organization.id}
                >
                    <div className="group relative p-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-50">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={membership.organization.imageUrl} alt={membership.organization.name} />
                            <AvatarFallback className="rounded-lg">
                                {"T"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grow-1">
                            <h3 className="text-base font-semibold text-gray-900">
                                <button onClick={() => handleSwitchTeam(membership.organization.id, membership.organization.slug!)} className="focus:outline-hidden">
                                        <span aria-hidden="true" className="absolute inset-0"/>
                                {membership.organization.name}
                                </button>
                                
                            </h3>
                            <div className="text-base text-gray-500">{membership.role == "org:admin" ? "Admin" : "Member"}</div>
                        </div>
                        <ArrowRight className="pointer-events-none text-gray-300 group-hover:text-gray-400"/>
                    </div>
                </li>)}
            </ul>
        </Show>
       
        { syncing ? <LoadingOverlay/> : null }
    </div>
}