/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { SkillPackageForm } from '@/components/forms/skill-package-form'
import { ObjectName } from '@/components/ui/typography'

import { useOrganization } from '@/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'
import { skillPackageSchema } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


export default function SkillPackageManagerModule_PackageUpdate_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/--update'>) {
    const { skill_package_id: skillPackageId } = use(props.params)
    
    const organization = useOrganization()
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: skillPackage } = useSuspenseQuery(trpc.skills.getPackage.queryOptions({ orgId: organization.orgId, skillPackageId }))


    const mutation = useMutation(trpc.skills.updatePackage.mutationOptions({
        async onMutate(data) {
            const updatedPackage = skillPackageSchema.parse(data)
            await queryClient.cancelQueries(trpc.skills.listPackages.queryFilter({ orgId: organization.orgId }))
            await queryClient.cancelQueries(trpc.skills.getPackage.queryFilter({ orgId: organization.orgId, skillPackageId }))

            const previousSkillPackages = queryClient.getQueryData(trpc.skills.listPackages.queryKey({ orgId: organization.orgId }))
            const previousSkillPackage = queryClient.getQueryData(trpc.skills.getPackage.queryKey({ orgId: organization.orgId, skillPackageId }))

            queryClient.setQueryData(trpc.skills.listPackages.queryKey({ orgId: organization.orgId }), (prev = []) => {
                return prev.map(sp => sp.skillPackageId === updatedPackage.skillPackageId ? { ...sp, ...updatedPackage} : sp)
            })
            queryClient.setQueryData(trpc.skills.getPackage.queryKey({ orgId: organization.orgId, skillPackageId }), updatedPackage)
            
            return { previousSkillPackages, previousSkillPackage }

        },
        async onError(error, _data, context) {
            if (context?.previousSkillPackages) {
                queryClient.setQueryData(trpc.skills.listPackages.queryKey({ orgId: organization.orgId }), context.previousSkillPackages)
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

            queryClient.invalidateQueries(trpc.skills.listPackages.queryFilter({ orgId: organization.orgId }))
            queryClient.invalidateQueries(trpc.skills.getPackage.queryFilter({ orgId: organization.orgId, skillPackageId }))
        }
    }))

    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.BackButton to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackageId)}>
                    {skillPackage.name}
                </Hermes.BackButton>
            </Hermes.SectionHeader>

            <SkillPackageForm
                mode="Update"
                organization={organization}
                skillPackage={skillPackage}
                onSubmit={async (data) => {
                    await mutation.mutateAsync({ ...data, orgId: organization.orgId })
                }}
            />
        </Hermes.Section>

        
    </Lexington.Column>
}