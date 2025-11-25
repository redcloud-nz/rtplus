/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SkillGroupForm } from '@/components/forms/skill-group-form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillGroupData, SkillGroupId } from '@/lib/schemas/skill-group'
import { SkillPackageId } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




export function SkillPackageManagerModule_CreateGroup_Form({ organization, skillPackageId }: { organization: OrganizationData, skillPackageId: SkillPackageId }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    
    const initSkillGroups = useMemo(() => ({
        skillGroupId: SkillGroupId.create(),
        skillPackageId,
        parentId: null,
        name: '',
        description: '',
        status: 'Active' as SkillGroupData['status'],
        tags: [],
        properties: {},
        sequence: 0
    } satisfies SkillGroupData), [])


    const mutation = useMutation(trpc.skills.createGroup.mutationOptions({
        onError(error) {
            toast({
                title: "Error creating skill group",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Skill Group Created",
                description: <>The skill group <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.getGroups.queryFilter({ skillPackageId }))
            router.push(Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackageId).group(result.skillGroupId).href)
        }
    }))

    return <SkillGroupForm
        mode="Create"
        organization={organization}
        skillGroup={initSkillGroups}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}
    />
}
