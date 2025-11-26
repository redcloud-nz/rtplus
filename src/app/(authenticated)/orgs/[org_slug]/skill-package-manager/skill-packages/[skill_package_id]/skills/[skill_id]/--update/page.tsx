/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/skills/[skill_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { SkillForm } from '@/components/forms/skill-form'
import { ObjectName } from '@/components/ui/typography'

import { useOrganization } from '@/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'

import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

export default function SkillPackageManagerModule_SkillUpdate_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/skills/[skill_id]/--update'>) {

    const { skill_package_id: skillPackageId, skill_id: skillId } = use(props.params)
    
    const organization = useOrganization()
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: { skillGroup, skillPackage, ...skill } } = useSuspenseQuery(trpc.skills.getSkill.queryOptions({ orgId: organization.orgId, skillPackageId, skillId }))


    const mutation = useMutation(trpc.skills.updateSkill.mutationOptions({
        onError(error) {
            toast({
                title: "Error updating skill",
                description: error.message,
                variant: 'destructive',
            })
        },
        async onSuccess() {
            toast({
                title: "Skill updated",
                description: <>The skill <ObjectName>{skill.name}</ObjectName> has been updated.</>,
            })
            router.push(Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).skill(skill.skillId).href)

            queryClient.invalidateQueries(trpc.skills.listSkills.queryFilter({ skillPackageId }))
            queryClient.invalidateQueries(trpc.skills.getSkill.queryFilter({ orgId: organization.orgId, skillPackageId, skillId }))
        }
    }))

    return <Lexington.Column width="lg">
            <Hermes.Section>
                <Hermes.SectionHeader>
                    <Hermes.BackButton to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).skill(skill.skillId)}>
                        {skill.name}
                    </Hermes.BackButton>
                </Hermes.SectionHeader>
            </Hermes.Section>
            
            <SkillForm
                mode="Update"
                organization={organization}
                skill={skill}
                onSubmit={async (data) => {
                    await mutation.mutateAsync({ ...data, orgId: organization.orgId })
                }}
            />
        </Lexington.Column>
}