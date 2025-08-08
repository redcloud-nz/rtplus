/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import * as React from 'react'
import * as R from 'remeda'

import { useSuspenseQuery } from '@tanstack/react-query'


import { Button } from '@/components/ui/button'
import { FieldControl, FieldDescription, FieldLabel, FieldMessage, Form, FormField, FormFooter, FormMessage, FormSubmitButton } from '@/components/ui/action-form'
import { Link } from '@/components/ui/link'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { SkillData } from '@/lib/schemas/skill'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { CompetenceLevelTerms } from '@/lib/terms'

import { useTRPC } from '@/trpc/client'




interface RecordSkillCheckPageProps {
    cancelHref: string
}


export function RecordSkillCheckForm({ cancelHref }: RecordSkillCheckPageProps) {
    const trpc = useTRPC()
    
    const { data: skillPackages } = useSuspenseQuery(trpc.skills.getTree.queryOptions())
    const { data: teamMembers } = useSuspenseQuery(trpc.activeTeam.members.getTeamMembers.queryOptions({ status: ['Active'] }))

    function renderSkillPackageSelectItems(skillPackage: SkillPackageData & { skillGroups: SkillGroupData[], skills: SkillData[] }) {
        if (skillPackage.skillGroups.length) {
            return <React.Fragment key={skillPackage.skillPackageId}>
                {skillPackage.skillGroups
                    .filter(skillGroup => skillGroup.parentId == null)
                    .map(skillGroup =>
                    renderSkillGroupSelectItems(skillPackage.name, skillGroup, skillPackage.skills)
                )}
            </React.Fragment>
        }
    }

    function renderSkillGroupSelectItems(parent: string, skillGroup: SkillGroupData, skills: SkillData[]) {
        return <SelectGroup key={skillGroup.skillGroupId}>
            <SelectLabel>{`${parent} / ${skillGroup.name}`}</SelectLabel>
            {skills
                .filter(skill => skill.skillGroupId == skillGroup.skillGroupId)
                .map(skill => 
                    <SelectItem key={skill.skillId} value={skill.skillId}>{skill.name}</SelectItem>
                )
            }
        </SelectGroup>
    }

    return <Form>
        <FormField name="skillId">
            <FieldLabel>Skill</FieldLabel>
            <FieldControl>
                <Select name="skillId">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a skill ..."/>
                    </SelectTrigger>
                    <SelectContent>
                        
                        {skillPackages.map(renderSkillPackageSelectItems)}
                    </SelectContent>
                </Select>
            </FieldControl>
            <FieldDescription>The skill to assess.</FieldDescription>
            <FieldMessage/>
        </FormField>
        <FormField name="assesseeId">
            <FieldLabel>Person</FieldLabel>
            <FieldControl>
                <Select name="assesseeId">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a person ..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {teamMembers.map(membership =>
                                <SelectItem 
                                    key={membership.personId} 
                                    value={membership.personId}
                                >{membership.person.name}</SelectItem>
                        )}
                        </SelectContent>
                    </Select>
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
                <Link href={cancelHref}>Cancel</Link>
            </Button>
        </FormFooter>
        <FormMessage/>
    </Form>
}


