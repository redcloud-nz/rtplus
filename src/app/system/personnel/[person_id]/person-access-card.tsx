/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { AsyncButton} from '@/components/ui/button'
import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import { useTRPC } from '@/trpc/client'



export function PersonAccessCard(props: { personId: string}) {


    return <Card>
            <CardHeader>
                <CardTitle>Access Details</CardTitle>
                <CardCollapseToggleButton/>
            </CardHeader>
            <CardBody boundary>
                <PersonAccessDetailsList personId={props.personId}/>
            </CardBody>
        </Card>
}

function PersonAccessDetailsList({ personId }: { personId: string }) {
    const queryClient = useQueryClient()
    const trpc = useTRPC()


    const { data: personAccess } = useSuspenseQuery(trpc.personnel.access.byId.queryOptions({ personId }))
    
    const inviteMutation = useMutation(trpc.personnel.access.invite.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.personnel.access.byId.queryFilter({ personId }))
        },
        onError: (error) => {
            console.error(error)
        }
    }))

    return <DL>
        <DLTerm>Onboarding Status</DLTerm>
        <DLDetails>{personAccess.onboardingStatus}</DLDetails>

        <DLTerm>Clerk User ID</DLTerm>
        <DLDetails>{personAccess.clerkUserId ?? "Not issued"}</DLDetails>

        <DLTerm>Actions</DLTerm>
        <DLDetails>
            <AsyncButton onClick={() => inviteMutation.mutateAsync({ personId })}>Invite</AsyncButton>
        </DLDetails>
    </DL>
}