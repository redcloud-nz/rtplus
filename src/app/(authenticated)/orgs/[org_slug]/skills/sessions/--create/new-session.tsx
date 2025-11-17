/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionId} from '@/lib/schemas/skill-check-session'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { SkillsModule_SessionForm } from '../session-form'


export function SkillsModule_NewSession_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const sessionId = useMemo(() => SkillCheckSessionId.create(), [])


    const mutation = useMutation(trpc.skillChecks.createSession.mutationOptions({
        onError(error) {
             toast({
                title: "Error creating session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            queryClient.invalidateQueries(trpc.skillChecks.getSessions.queryFilter({ orgId: organization.orgId }))
            
            toast({
                title: "Session created",
                description: `The session ${result.name} has been created successfully.`,
            })
            router.push(Paths.org(organization.slug).skills.session(result.sessionId).href)
        }
    }))

    return <SkillsModule_SessionForm
        mode="Create"
        organization={organization}
        session={{ sessionId, name: '', date: formatISO(new Date(), { representation: 'date' }), notes: "", sessionStatus: 'Draft' }}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })

        }} 
    />
}