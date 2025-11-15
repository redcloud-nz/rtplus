/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */

'use client'

import { useRouter } from 'next/navigation'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { useToast } from '@/hooks/use-toast'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { SkillsModule_SessionForm } from '../../session-form'



export function SkillsModule_UpdateSession_Form({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const skillsPath = Paths.org(organization.slug).skills

    const mutation = useMutation(trpc.skillChecks.updateSession.mutationOptions({
        async onMutate(data) {

        },
        onError(error) {
             toast({
                title: "Error updating session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            queryClient.invalidateQueries(trpc.skillChecks.getSessions.queryFilter({ orgId: organization.orgId }))
            
            toast({
                title: "Session updated",
                description: `The session ${result.name} has been updated successfully.`,
            })
            router.push(skillsPath.session(result.sessionId).href)
        }
    }))

    return <SkillsModule_SessionForm
        mode="Update"
        organization={organization}
        session={session}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}
    />
}