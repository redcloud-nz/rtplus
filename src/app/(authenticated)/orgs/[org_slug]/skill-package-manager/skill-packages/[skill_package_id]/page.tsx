/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]
 */

'use client'

import { use, useState } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQueries} from '@tanstack/react-query'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { DeleteObjectIcon, DropdownMenuTriggerIcon, EditObjectIcon, ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { S2_Value } from '@/components/ui/s2-value'

import { useOrganization } from '@/hooks/use-organization'
import * as Paths from '@/paths'

import { trpc } from '@/trpc/client'
import { AdminModule_SkillPackage_Groups_Section } from './skill-package-groups'
import { AdminModule_SkillPackage_Skills_Section } from './skill-package-skills'
import { AdminModule_DeleteSkillPackage_Dialog } from './delete-skill-package'



export default function AdminModule_SkillPackage_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = use(props.params)
    
    const organization = useOrganization()

    const [
        { data: skillPackage },
        { data: groups },
        { data: skills }
    ] = useSuspenseQueries({
        queries: [
            trpc.skills.getPackage.queryOptions({ orgId: organization.orgId, skillPackageId }),
            trpc.skills.getGroups.queryOptions({ orgId: organization.orgId, skillPackageId }),
            trpc.skills.getSkills.queryOptions({ orgId: organization.orgId, skillPackageId })
        ]
    })

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return <Lexington.Column width="xl">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(orgSlug).skillPackageManager.skillPackages}>
                        <ToParentPageIcon/> Back to Skill Packages
                    </Link>
                </S2_Button>
                <Protect role="org:admin">
                    <ButtonGroup>
                        <S2_Button variant="outline" asChild>
                            <Link to={Paths.org(orgSlug).skillPackageManager.skillPackage(skillPackageId).update}>
                                <EditObjectIcon/> Edit
                            </Link>
                        </S2_Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <S2_Button variant="outline" size="icon">
                                    <DropdownMenuTriggerIcon /> <span className="sr-only">Open menu</span>
                                </S2_Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteDialogOpen(true)}>
                                        <DeleteObjectIcon/> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AdminModule_DeleteSkillPackage_Dialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                            organization={organization}
                            skillPackage={skillPackage}
                        />
                    </ButtonGroup>
                </Protect>
            </Hermes.SectionHeader>
            <S2_Card>
                <S2_CardHeader>
                    <S2_CardTitle>{skillPackage.name}</S2_CardTitle>
                    <S2_CardDescription>ID: {skillPackage.skillPackageId}</S2_CardDescription>
                </S2_CardHeader>
                <S2_CardContent>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldLabel>Description</FieldLabel>
                            <S2_Value className="min-w-1/2">{skillPackage.description || <span className="text-muted-foreground">No description</span>}</S2_Value>
                        </Field>
                        <Field orientation="responsive">
                            <FieldLabel>Status</FieldLabel>
                            <S2_Value className="min-w-1/2">{skillPackage.status}</S2_Value>
                        </Field>
                    </FieldGroup>
                </S2_CardContent>
            </S2_Card>
        </Hermes.Section>

        <AdminModule_SkillPackage_Groups_Section organization={organization} skillPackage={skillPackage} groups={groups} />
        <AdminModule_SkillPackage_Skills_Section organization={organization} skillPackage={skillPackage} skills={skills} />
    </Lexington.Column>
}