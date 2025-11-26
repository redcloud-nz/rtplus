/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SkillPackageForm } from '@/components/forms/skill-package-form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillPackageData, SkillPackageId, skillPackageSchema } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'





export function SkillPackageManagerModule_CreatePackage_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const initSkillPackage = useMemo(() => ({
        skillPackageId: SkillPackageId.create(),
        ownerOrgId: organization.orgId,
        name: '',
        description: '',
        status: 'Active' as SkillPackageData['status'],
        tags: [],
        properties: {}
    } satisfies SkillPackageData), [])

    const mutation = useMutation(trpc.skills.createPackage.mutationOptions({
        async onMutate(data) {
            const newPackage = skillPackageSchema.parse(data)

            await queryClient.cancelQueries(trpc.skills.listPackages.queryFilter())

            const previousPackages = queryClient.getQueryData(trpc.skills.listPackages.queryKey())

            queryClient.setQueryData(trpc.skills.listPackages.queryKey(), (prev = []) => [...prev, { ...newPackage, _count: { skills: 0, skillGroups: 0 } }])
            queryClient.setQueryData(trpc.skills.getPackage.queryKey({ skillPackageId: newPackage.skillPackageId }), newPackage)

            return { previousPackages }
        },
        onError(error, _variables, context) {
            if(context?.previousPackages) {
                queryClient.setQueryData(trpc.skills.listPackages.queryKey(), context.previousPackages)
            }

            toast({
                title: "Error creating skill package",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Skill Package Created",
                description: <>Skill package <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.listPackages.queryFilter())
            router.push(Paths.org(organization.slug).skillPackageManager.skillPackage(result.skillPackageId).href)
        }
    }))

    return <SkillPackageForm
        mode="Create"
        organization={organization} 
        skillPackage={initSkillPackage}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}
    />
}