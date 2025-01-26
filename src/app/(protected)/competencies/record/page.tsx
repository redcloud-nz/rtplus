/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/record
 */
'use client'

import * as React from 'react'
import * as R from 'remeda'

import { Skill, SkillGroup } from '@prisma/client'

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { Show } from '@/components/show'

import { Button } from '@/components/ui/button'
import { FieldControl, FieldDescription, FieldLabel, FieldMessage, Form, FormField, FormFooter, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Link } from '@/components/ui/link'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import { SkillPackageWithGroupsAndSkills, useSkillPackagesQuery } from '@/lib/api/skills'
import { useTeamsWithMembersQuery } from '@/lib/api/teams'
import { CompetenceLevelTerms } from '@/lib/terms'

import * as Paths from '@/paths'

import { recordSkillCheckAction } from './record-skill-check-action'



export default function RecordSkillCheckPage() {

    const skillPackagesQuery = useSkillPackagesQuery()
    const teamsQuery = useTeamsWithMembersQuery()
    
    function renderSkillPackageSelectItems(skillPackage: SkillPackageWithGroupsAndSkills) {
        return <React.Fragment key={skillPackage.id}>
            {skillPackage.skillGroups
                .filter(skillGroup => skillGroup.parentId == null)
                .map(skillGroup =>
                    renderSkillGroupSelectItems(skillPackage.name, skillGroup, skillPackage.skills)
            )}
        </React.Fragment>
    }

    function renderSkillGroupSelectItems(parent: string, skillGroup: SkillGroup, skills: Skill[]) {
        return <SelectGroup key={skillGroup.id}>
            <SelectLabel>{`${parent} / ${skillGroup.name}`}</SelectLabel>
            {skills
                .filter(skill => skill.skillGroupId == skillGroup.id)
                .map(skill => 
                    <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                )
            }
        </SelectGroup>
    }

    return <AppPage
        label="Single Check"
        breadcrumbs={[{ label: 'Competencies', href: Paths.competencies.dashboard }]}
    >
        <PageHeader>
            <PageTitle>Record Skill Check</PageTitle>
        </PageHeader>
        <Form action={recordSkillCheckAction}>
            <FormField name="skillId">
                <FieldLabel>Skill</FieldLabel>
                <FieldControl>
                    <Show
                        when={skillPackagesQuery.isSuccess}
                        fallback={<Skeleton className="h-10 w-full" variant="text">Finding Skills</Skeleton>}
                    >
                        <Select name="skillId">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a skill ..."/>
                            </SelectTrigger>
                            <SelectContent>
                                
                                {skillPackagesQuery.data?.map(renderSkillPackageSelectItems)}
                            </SelectContent>
                        </Select>
                    </Show>
                </FieldControl>
                <FieldDescription>The skill to assess.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="assesseeId">
                <FieldLabel>Person</FieldLabel>
                <FieldControl>
                    <Show
                        when={skillPackagesQuery.isSuccess}
                        fallback={<Skeleton className="h-10 w-full" variant="text">Finding Personnel</Skeleton>}
                    >
                        <Select name="assesseeId">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a person ..."/>
                            </SelectTrigger>
                            <SelectContent>
                                {teamsQuery.data?.map(team =>
                                    <SelectGroup key={team.id}>
                                        <SelectLabel>{team.name}</SelectLabel>
                                        {team.teamMemberships.map(membership =>
                                            <SelectItem key={membership.id} value={membership.person.id}>{membership.person.name}</SelectItem>
                                        )}
                                    </SelectGroup>
                               )}
                            </SelectContent>
                        </Select>
                    </Show>
                </FieldControl>
                <FieldDescription>The person to assess.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="competenceLevel">
                <FieldLabel>Competence Level</FieldLabel>
                <FieldControl>
                    <Select name="competenceLevel">
                        <SelectTrigger>
                            <SelectValue placeholder="Select competence level ..."/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Competence Level</SelectLabel>
                                {R.entries(CompetenceLevelTerms).map(([key, label]) =>
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </FieldControl>
                <FieldDescription>The level of competence demonstrated.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="notes">
                <FieldLabel>Notes</FieldLabel>
                <FieldControl>
                    <Textarea name="notes"/>
                </FieldControl>
                <FieldDescription>Any additional notes or comments.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormFooter>
                <FormSubmitButton label="Submit" loading="Submitting"/>
                <Button variant="ghost" asChild>
                    <Link href={Paths.competencies.dashboard}>Cancel</Link>
                </Button>
            </FormFooter>
            <FormMessage/>
        </Form>
    </AppPage>
}


