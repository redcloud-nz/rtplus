/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SkillPackageForm } from '@/components/forms/skill-package-form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillPackageData, skillPackageSchema } from '@/lib/schemas/skill-package'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'





export function AdminModile_CreateSkillPackage_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    

    const skillPackageId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillPackageData>({
        resolver: zodResolver(skillPackageSchema),
        defaultValues: {
            skillPackageId,
            name: '',
            description: '',
            status: 'Active',
            tags: [],
            properties: {}
        }
    })

    const mutation = useMutation(trpc.skills.createPackage.mutationOptions({
        async onMutate(data) {
            const newPackage = skillPackageSchema.parse(data)

            await queryClient.cancelQueries(trpc.skills.getPackages.queryFilter())

            const previousPackages = queryClient.getQueryData(trpc.skills.getPackages.queryKey())

            queryClient.setQueryData(trpc.skills.getPackages.queryKey(), (prev = []) => [...prev, { ...newPackage, _count: { skills: 0, skillGroups: 0 } }])
            queryClient.setQueryData(trpc.skills.getPackage.queryKey({ skillPackageId: newPackage.skillPackageId }), newPackage)

            return { previousPackages }
        },
        onError(error, _variables, context) {
            if(context?.previousPackages) {
                queryClient.setQueryData(trpc.skills.getPackages.queryKey(), context.previousPackages)
            }

            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillPackageData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating skill package",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            toast({
                title: "Skill Package Created",
                description: <>Skill package <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.getPackages.queryFilter())
            router.push(Paths.org(organization.slug).skillPackageManager.skillPackage(result.skillPackageId).href)
        }
    }))

    return <SkillPackageForm
        mode="Create"
        form={form}
        organization={organization} 
        skillPackageId={skillPackageId}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}
    />
}