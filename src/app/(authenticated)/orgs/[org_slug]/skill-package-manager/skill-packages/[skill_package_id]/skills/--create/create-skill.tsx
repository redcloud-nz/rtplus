/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { z } from 'zod'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SkillForm } from '@/components/forms/skill-form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillId, skillSchema } from '@/lib/schemas/skill'
import { SkillPackageId } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function SkillPackageModule_CreateSkill_Form({ organization, skillPackageId }: { organization: OrganizationData, skillPackageId: SkillPackageId }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const initialSkill = useMemo(() => ({
        skillId: SkillId.create(),
        skillPackageId,
        skillGroupId: '',
        name: '',
        description: '',
        status: 'Active',
        tags: [],
        properties: {},
        sequence: 0
    } satisfies z.input<typeof skillSchema>), [])

    const mutation = useMutation(trpc.skills.createSkill.mutationOptions({
        onError(error) {
            toast({
                title: "Error creating skill",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Skill Created",
                description: <>The skill <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.getSkills.queryFilter({ skillPackageId }))

            router.push(Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackageId).skill(result.skillId).href)
        }
    }))

    return <SkillForm
        mode="Create"
        organization={organization}
        skill={initialSkill}
        onSubmit={async data => {
             await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}
    />
}
