/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/skills/[skill_id]
 */

'use client'

import { use, useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'


import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { DeleteObjectIcon, DropdownMenuTriggerIcon, EditObjectIcon } from '@/components/icons'
import { S2_Card, S2_CardAction, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link, TextLink } from '@/components/ui/link'
import { S2_Value } from '@/components/ui/s2-value'

import { useOrganization } from '@/hooks/use-organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { SkillPackageManagerModule_DeleteSkill_Dialog } from './delete-skill'


/**
 * Page that display details about a specific skill within a skill package.
 */
export default function SkillPackageManagerModule_Skill_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId, skill_id: skillId } = use(props.params)
    const { from } = use(props.searchParams)

    const organization = useOrganization()
    
    const { data: skill } = useSuspenseQuery(trpc.skills.getSkill.queryOptions({ orgId: organization.orgId, skillId, skillPackageId }))

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.BackButton to={Paths.org(orgSlug).skillPackageManager.skillPackage(skill.skillPackageId)}>
                    { skill.skillPackage.name}
                </Hermes.BackButton>
                <ButtonGroup>
                    <S2_Button variant='outline' asChild>
                        <Link to={Paths.org(orgSlug).skillPackageManager.skillPackage(skill.skillPackageId).skill(skill.skillId).update}>
                            <EditObjectIcon/> Edit Skill
                        </Link>
                    </S2_Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <S2_Button variant='outline' size="icon">
                                <DropdownMenuTriggerIcon/>
                            </S2_Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Skill Menu</DropdownMenuLabel>
                            <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteDialogOpen(true)}>
                                <DeleteObjectIcon/> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <SkillPackageManagerModule_DeleteSkill_Dialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        organization={organization}
                        skill={skill}
                    />
                </ButtonGroup>
            </Hermes.SectionHeader>

            <S2_Card>
                <S2_CardHeader>
                    <S2_CardTitle>{skill.name}</S2_CardTitle>
                    <S2_CardDescription>ID: {skill.skillId}</S2_CardDescription>
                    <S2_CardAction className="text-muted-foreground text-sm">Skill</S2_CardAction>
                </S2_CardHeader>
                <S2_CardContent>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldLabel>Skill ID</FieldLabel>
                            <S2_Value>{skill.skillId}</S2_Value>
                        </Field>
                        <Field orientation="responsive">
                            <FieldLabel>Skill Package</FieldLabel>
                            <S2_Value>
                                <TextLink to={Paths.org(orgSlug).skillPackageManager.skillPackage(skill.skillPackageId)}>
                                    {skill.skillPackage.name}
                                </TextLink>
                            </S2_Value>
                        </Field>
                        {skill.skillGroupId && 
                            <Field orientation="responsive">
                                <FieldLabel>Skill Group</FieldLabel>
                                <S2_Value>
                                    <TextLink to={Paths.org(orgSlug).skillPackageManager.skillPackage(skill.skillPackageId).group(skill.skillGroupId!)}>
                                        {skill.skillGroup.name}
                                    </TextLink>
                                </S2_Value>
                            </Field>
                            
                        }
                        <Field>
                            <FieldLabel>Description</FieldLabel>
                            <S2_Value>{skill.description || <span className="text-muted-foreground">No description</span>}</S2_Value>
                        </Field>
                        <Field orientation="responsive">
                            <FieldLabel>Status</FieldLabel>
                            <S2_Value>{skill.status}</S2_Value>
                        </Field>
                    </FieldGroup>
                </S2_CardContent>
            </S2_Card>
        </Hermes.Section>
    </Lexington.Column>
}