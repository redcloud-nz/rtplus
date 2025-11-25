/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/groups/[skill_group_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { SkillGroupForm } from '@/components/forms/skill-group-form'
import { ObjectName } from '@/components/ui/typography'

import { useOrganization } from '@/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'
import { skillGroupSchema } from '@/lib/schemas/skill-group'

import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export default function SkillPackageManagerModule_GroupUpdate_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/groups/[skill_group_id]/--update'>) {

    const { skill_package_id: skillPackageId, skill_group_id: skillGroupId } = use(props.params)
    
    const organization = useOrganization()
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: { skillPackage, ...skillGroup} } = useSuspenseQuery(trpc.skills.getGroup.queryOptions({ orgId: organization.orgId, skillPackageId, skillGroupId }))


    const mutation = useMutation(trpc.skills.updateGroup.mutationOptions({
        async onMutate(data) {
            const updatedGroup = skillGroupSchema.parse(data)
            await queryClient.cancelQueries(trpc.skills.getGroups.queryFilter({ orgId: organization.orgId, skillPackageId }))
            await queryClient.cancelQueries(trpc.skills.getGroup.queryFilter({ orgId: organization.orgId, skillPackageId, skillGroupId }))

            const previousSkillGroups = queryClient.getQueryData(trpc.skills.getGroups.queryKey({ orgId: organization.orgId, skillPackageId }))
            const previousSkillGroup = queryClient.getQueryData(trpc.skills.getGroup.queryKey({ orgId: organization.orgId, skillPackageId, skillGroupId }))

            queryClient.setQueryData(trpc.skills.getGroups.queryKey({ orgId: organization.orgId, skillPackageId }), (prev = []) => {
                return prev.map(sg => sg.skillGroupId === updatedGroup.skillGroupId ? { ...sg, ...updatedGroup} : sg)
            })
            queryClient.setQueryData(trpc.skills.getGroup.queryKey({ orgId: organization.orgId, skillPackageId, skillGroupId }), { ...updatedGroup, skillPackage })

            return { previousSkillGroups, previousSkillGroup }
        },
        onError(error, _data, context) {
            if (context?.previousSkillGroups) {
                queryClient.setQueryData(trpc.skills.getGroups.queryKey({ orgId: organization.orgId, skillPackageId }), context.previousSkillGroups)
            }
            if (context?.previousSkillGroup) {
                queryClient.setQueryData(trpc.skills.getGroup.queryKey({ orgId: organization.orgId, skillPackageId, skillGroupId }), context.previousSkillGroup)
            }
            toast({
                title: 'Error updating skill group',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess() {
            toast({
                title: 'Skill group updated',
                description: <>The skill group <ObjectName>{skillGroup.name}</ObjectName> has been updated.</>,
            })
            router.push(Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackageId).group(skillGroupId).href)

            queryClient.invalidateQueries(trpc.skills.getGroups.queryFilter({ orgId: organization.orgId, skillPackageId }))
            queryClient.invalidateQueries(trpc.skills.getGroup.queryFilter({ orgId: organization.orgId, skillPackageId, skillGroupId }))
        }
    }))

     return <Lexington.Column width="lg">
            <Hermes.Section>
                <Hermes.SectionHeader>
                    <Hermes.BackButton to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).group(skillGroup.skillGroupId)}>
                        {skillGroup.name}
                    </Hermes.BackButton>
                </Hermes.SectionHeader>
                
                <SkillGroupForm
                    mode="Update"
                    
                    organization={organization}
                    skillGroup={skillGroup}
                    onSubmit={async (data) => {
                        await mutation.mutateAsync({ ...data, orgId: organization.orgId })
                    }}
                />
            </Hermes.Section>
        </Lexington.Column>
}