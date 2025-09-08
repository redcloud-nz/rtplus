/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { match } from 'ts-pattern'

import { useAuth, useOrganizationList, useUser } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'

import { PageDescription } from '@/components/app-page'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { LoadingSpinner } from '@/components/ui/loading'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'


import * as Paths from '@/paths'



/**
 * A page to select which team to use.
 * Also includes:
 * - Switch to personal account
 * - Accept invitations
 */
export default function SelectTeam_PageContent() {

    const queryClient = useQueryClient()
    const router = useRouter()

    const auth = useAuth()
    const { user } = useUser()
    const organizationList = useOrganizationList({
        userMemberships: {
            keepPreviousData: true,
            infinite: true
        },
        userInvitations: {
            keepPreviousData: true,
            infinite: true
        }
    })

    const memberships = organizationList.userMemberships.data || []

    const invitations = organizationList.userInvitations.data || []

    async function handleSwitchTeam(organization: typeof memberships[0]['organization']) {
        organizationList.setActive?.({ organization: organization.id })

        queryClient.clear()

        if(organization.slug == 'system') {
            router.push(Paths.system.href)
        } else {
            router.push(Paths.team(organization.slug!).href)
        }
    }

    async function handleSwitchToPersonalAccount() {
        organizationList.setActive?.({ organization: null })

        queryClient.clear()

        router.push(Paths.personal.index)
    }

    async function handleAcceptInvitation(invitation: typeof invitations[0]) {
        await invitation.accept()

        queryClient.clear()
        router.push(Paths.team(invitation.publicOrganizationData.slug!).href)
    }

    return <Show 
        when={auth.isLoaded && organizationList.isLoaded}
        fallback={<div className="flex items-center justify-center h-64">
            <LoadingSpinner className="h-32 w-32"/>
        </div>}
    >
        
        <PageDescription>Select a team to use:</PageDescription>

        <Card>
            <CardHeader>
                <CardTitle>Your Teams</CardTitle>
                <CardActions>
                    <Show when={user?.createOrganizationEnabled ?? false}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" asChild>
                                    <Link to={Paths.createTeam}>
                                        <PlusIcon/>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Create New Team
                            </TooltipContent>
                        </Tooltip>
                        
                    </Show>
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        These are the teams that you have been given RT+ access to. You can switch between these to access team specific data.
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Show 
                    when={memberships.length > 0}
                    fallback={<Alert severity="info" title="No available teams"/>}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className="w-[40px] hidden md:table-cell"></TableHeadCell>
                                <TableHeadCell>Team Name</TableHeadCell>
                                <TableHeadCell className="text-center">Type</TableHeadCell>
                                <TableHeadCell className="text-center">Role</TableHeadCell>
                                <TableHeadCell className="w-[40px]"></TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {memberships
                                ?.sort((a, b) => a.organization.name.localeCompare(b.organization.name))
                                ?.map((membership) => <TableRow key={membership.id}>
                                    <TableHeadCell className="hidden md:table-cell">
                                        <Avatar className="h-6 w-6 rounded-lg">
                                            <AvatarImage src={membership.organization.imageUrl || ""} alt={membership.organization.name} />
                                            <AvatarFallback className="rounded-lg">
                                                T
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableHeadCell>
                                    <TableHeadCell>{membership.organization.name}</TableHeadCell>
                                    <TableHeadCell className="text-center">
                                        {match(membership.organization.publicMetadata.type)
                                            .with('Normal', () => <><span className="hidden md:inline">Normal</span><span className="inline md:hidden">Nrm</span></>)
                                            .with('System', () => <><span className="hidden md:inline">System</span><span className="inline md:hidden">Sys</span></>)
                                            .with('Sandbox', () => <><span className="hidden md:inline">Sandbox</span><span className="inline md:hidden">Sbx</span></>)
                                            .exhaustive()
                                        }
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">{membership.role == 'org:admin' ? 'Admin' : 'User'}</TableHeadCell>
                                    <TableHeadCell className="pt-0.5">
                                        {membership.organization.id == auth.orgId 
                                            ? <span className="text-sm italic text-muted-foreground">Active</span>
                                            : <Button size="sm" onClick={() => handleSwitchTeam(membership.organization)}>Use</Button>
                                        }
                                    </TableHeadCell>
                                </TableRow>)
                            }
                        </TableBody>
                    </Table>
                </Show>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Personal Account</CardTitle>
                <CardActions>
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        Use RT+ with personal account not associated with any team.
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <div className="flex items-center px-2">
                    <div className="hidden md:inline-block w-[40px]">
                        <Avatar className="h-6 w-6 rounded-lg">
                            <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ""} />
                            <AvatarFallback className="rounded-lg">P</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="font-medium grow">
                        {user?.fullName}
                    </div>
                    <div>
                        {auth.orgId == null 
                            ? <span className="text-sm italic text-muted-foreground">Active</span>
                            : <Button size="sm" onClick={handleSwitchToPersonalAccount}>Use</Button>
                        }
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Invitations</CardTitle>
                <CardActions>
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        These are the teams that you have been invited to join. Accepting an invitation will give you access to RT+ for that team.
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Show 
                    when={invitations.length > 0}
                    fallback={<Alert severity="info" title="No pending invitations"/>}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className="w-[40px] hidden md:table-cell"></TableHeadCell>
                                <TableHeadCell>Team Name</TableHeadCell>
                                <TableHeadCell className="text-center">Role</TableHeadCell>
                                <TableHeadCell className="w-[40px]"></TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invitations
                                ?.sort((a, b) => a.publicOrganizationData.name.localeCompare(b.publicOrganizationData.name))
                                ?.map((invitation) => <TableRow key={invitation.id}>
                                    <TableHeadCell className="hidden md:table-cell">
                                        <Avatar className="h-6 w-6 rounded-lg">
                                            <AvatarImage src={invitation.publicOrganizationData.imageUrl || ""} alt={invitation.publicOrganizationData.name} />
                                            <AvatarFallback className="rounded-lg">
                                                T
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableHeadCell>
                                    <TableHeadCell>{invitation.publicOrganizationData.name}</TableHeadCell>
                                    <TableHeadCell className="text-center">{invitation.role == 'org:admin' ? 'Admin' : 'User'}</TableHeadCell>
                                    <TableHeadCell className="pt-0.5">
                                        <Button size="sm" onClick={() => handleAcceptInvitation(invitation)}>
                                            Accept
                                        </Button>
                                    </TableHeadCell>
                                </TableRow>)
                            }
                        </TableBody>
                    </Table>
                </Show>
            </CardContent>
        </Card>
    </Show>

}