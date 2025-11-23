/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { ObjectName } from '@/components/ui/typography'

import { useOrganization } from '@/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'
import { SkillPackageData, skillPackageSchema } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'
import { Lexington } from '@/components/blocks/lexington'
import { S2_Button } from '@/components/ui/s2-button'
import { ToParentPageIcon } from '@/components/icons'
import { Hermes } from '@/components/blocks/hermes'
import { Link } from '@/components/ui/link'
import { SkillPackageForm } from '@/components/forms/skill-package-form'




export default function AdminModule_TeamUpdate_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/--update'>) {
    const { skill_package_id: skillPackageId } = use(props.params)
    
    const organization = useOrganization()
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: skillPackage } = useSuspenseQuery(trpc.skills.getPackage.queryOptions({ orgId: organization.orgId, skillPackageId }))

    const form = useForm<SkillPackageData>({
        resolver: zodResolver(skillPackageSchema),
        defaultValues: { ...skillPackage }
    })

    const mutation = useMutation(trpc.skills.updatePackage.mutationOptions({
        async onMutate(data) {
            const updatedPackage = skillPackageSchema.parse(data)
            await queryClient.cancelQueries(trpc.skills.getPackages.queryFilter({ orgId: organization.orgId }))

            const previousSkillPackages = queryClient.getQueryData(trpc.skills.getPackages.queryKey({ orgId: organization.orgId }))
            const previousSkillPackage = queryClient.getQueryData(trpc.skills.getPackage.queryKey({ orgId: organization.orgId, skillPackageId }))

            queryClient.setQueryData(trpc.skills.getPackages.queryKey({ orgId: organization.orgId }), (prev = []) => {
                return prev.map(sp => sp.skillPackageId === updatedPackage.skillPackageId ? { ...sp, ...updatedPackage} : sp)
            })
            queryClient.setQueryData(trpc.skills.getPackage.queryKey({ orgId: organization.orgId, skillPackageId }), updatedPackage)
            
            return { previousSkillPackages, previousSkillPackage }

        },
        async onError(error, _data, context) {
            if (context?.previousSkillPackages) {
                queryClient.setQueryData(trpc.skills.getPackages.queryKey({ orgId: organization.orgId }), context.previousSkillPackages)
            }
            if (context?.previousSkillPackage) {
                queryClient.setQueryData(trpc.skills.getPackage.queryKey({ orgId: organization.orgId, skillPackageId }), context.previousSkillPackage)
            }

            toast({
                title: 'Error updating skill package',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess() {
            toast({
                title: 'Skill package updated',
                description: <>The skill package <ObjectName>{skillPackage.name}</ObjectName> has been updated.</>,
            })
            router.push(Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackageId).href)

            queryClient.invalidateQueries(trpc.skills.getPackages.queryFilter({ orgId: organization.orgId }))
            queryClient.invalidateQueries(trpc.skills.getPackage.queryFilter({ orgId: organization.orgId, skillPackageId }))
        }
    }))

    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackageId)}>
                        <ToParentPageIcon/> {skillPackage.name}
                    </Link>
                </S2_Button>
            </Hermes.SectionHeader>
        </Hermes.Section>

        <SkillPackageForm
            mode="Update"
            form={form}
            organization={organization}
            skillPackageId={skillPackageId}
            onSubmit={async (data) => {
                await mutation.mutateAsync({ ...data, orgId: organization.orgId })
            }}
        />
    </Lexington.Column>
}