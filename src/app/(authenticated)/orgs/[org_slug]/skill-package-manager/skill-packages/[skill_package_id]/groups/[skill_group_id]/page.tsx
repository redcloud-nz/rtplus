/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /org/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/groups/[skill_group_id]
 */
'use client'

import { use, useState } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQueries } from '@tanstack/react-query'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { DeleteObjectIcon, DropdownMenuTriggerIcon, EditObjectIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { S2_Card, S2_CardAction, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link, TextLink } from '@/components/ui/link'
import { S2_Value } from '@/components/ui/s2-value'

import { useOrganization } from '@/hooks/use-organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { SkillPackageManagerModule_DeleteSkillGroup_Dialog } from './delete-skill-group'
import { SkillPackageManagerModule_Group_Skills_Section } from './skill-group-skills'




export default function SkillPackageManagerModule_SkillGroup_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/groups/[skill_group_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId, skill_group_id: skillGroupId } = use(props.params)
   
    const organization = useOrganization()

    const [
        { data: skillGroup },
        { data: skills }
    ] = useSuspenseQueries({
        queries: [
            trpc.skills.getGroup.queryOptions({ orgId: organization.orgId, skillPackageId, skillGroupId }),
            trpc.skills.listSkills.queryOptions({ orgId: organization.orgId, skillPackageId, skillGroupId })
        ]
    })

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.BackButton to={Paths.org(orgSlug).skillPackageManager.skillPackage(skillPackageId)}>
                    {skillGroup.skillPackage.name}
                </Hermes.BackButton>

                <Protect role="org:admin">
                    <ButtonGroup>
                        <S2_Button variant="outline" asChild>
                            <Link to={Paths.org(orgSlug).skillPackageManager.skillPackage(skillPackageId).group(skillGroupId).update}>
                                <EditObjectIcon/> Edit
                            </Link>
                        </S2_Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <S2_Button variant="outline" size="icon">
                                    <DropdownMenuTriggerIcon/> <span className="sr-only">Open menu</span>
                                </S2_Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Skill Group Menu</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-destructive">
                                    <DeleteObjectIcon/> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <SkillPackageManagerModule_DeleteSkillGroup_Dialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                            organization={organization}
                            skillGroup={skillGroup}
                        />
                    </ButtonGroup>
                </Protect>
            </Hermes.SectionHeader>
            <S2_Card>
                <S2_CardHeader>
                    <S2_CardTitle>{skillGroup.name}</S2_CardTitle>
                    <S2_CardAction className="text-muted-foreground text-sm">Skill Group</S2_CardAction>
                </S2_CardHeader>
                <S2_CardContent>
                    <FieldGroup>
                        <FieldGroup>
                            <Field orientation="responsive">
                                <FieldLabel>Skill Group ID</FieldLabel>
                                <S2_Value>{skillGroup.skillGroupId}</S2_Value>
                            </Field>
                            <Field orientation="responsive">
                                <FieldLabel>Skill Package</FieldLabel>
                                <S2_Value>
                                    <TextLink to={Paths.org(orgSlug).skillPackageManager.skillPackage(skillGroup.skillPackage.skillPackageId)}>
                                        {skillGroup.skillPackage.name}
                                    </TextLink>
                                </S2_Value>
                            </Field>
                            <Field orientation="responsive">
                                <FieldLabel>Name</FieldLabel>
                                <S2_Value>{skillGroup.name}</S2_Value>
                            </Field>
                            <Field orientation="responsive">
                                <FieldLabel>Description</FieldLabel>
                                <S2_Value>{skillGroup.description || <span className="text-muted-foreground">No description</span>}</S2_Value>
                            </Field>
                            <Field orientation="responsive">
                                <FieldLabel>Status</FieldLabel>
                                <S2_Value>{skillGroup.status}</S2_Value>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </S2_CardContent>
            </S2_Card>
        </Hermes.Section>

        <SkillPackageManagerModule_Group_Skills_Section
            organization={organization}
            skillPackage={skillGroup.skillPackage}
            skillGroup={skillGroup}
            skills={skills}
        />
    </Lexington.Column>
}