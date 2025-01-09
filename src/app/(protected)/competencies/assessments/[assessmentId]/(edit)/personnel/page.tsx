/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments/[assessmentId]/(edit)/personnel
 */
'use client'

import { without } from 'lodash'
import React from 'react'

import { Show } from '@/components/show'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Description } from '@/components/ui/typography'

import { useTeamsWithMembersQuery } from '@/lib/api/teams'

import { useAssessmentContext } from '../../assessment-context'




export default function AssessmentPersonnel() {

    const assessmentContext = useAssessmentContext()
    const teamsQuery = useTeamsWithMembersQuery()
    
    const selectedPersonnel = assessmentContext.value.assesseeIds

    function handleSelectPerson(personId: string, checked: boolean) {
        assessmentContext.updateValue(prev => ({
            ...prev,
            assesseeIds: checked
                ? [...prev.assesseeIds, personId]
                : without(prev.assesseeIds, personId)
        }))
    }

    return <>
        <Description>Select the personnel to be assessed:</Description>
        { (teamsQuery.isPending || teamsQuery.isPending) ? <div className="flex flex-col items-stretch gap-2">
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
        </div>: null}
        { teamsQuery.isSuccess ? <Show 
            when={teamsQuery.data.length > 0}
            fallback={<Alert severity="info" title="No Teams Found"/>}
        >
            <Accordion type="single" collapsible>
                {teamsQuery.data.map(team => {
                    if(!team) return null

                    const memberCount = team.memberships.length
                    const selectedCount = team.memberships.filter(membership => selectedPersonnel.includes(membership.personId)).length

                    return <AccordionItem key={team.id} value={team.id}>
                        <AccordionTrigger>
                            <div className="flex-grow text-left">{team.name}</div>
                            <div className="text-xs text-muted-foreground mr-4">{selectedCount} of {memberCount} selected</div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="pl-2">
                                {team.memberships.map(member => {
                                    return <li key={member.personId} className="flex items-top space-x-2 py-1 px-2">
                                        <Checkbox id={`checkbox-${member.person.id}`} 
                                            checked={selectedPersonnel.includes(member.personId) || false}
                                            onCheckedChange={(checked) => handleSelectPerson(member.personId, checked === true)}
                                        />
                                        <div className="grid gap-1.5 leading-none ">
                                            <Label htmlFor={`checkbox-${member.personId}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{member.person.name}</Label>
                                        </div>
                                    </li>
                                })}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                })}
            </Accordion>
        </Show> : null }
    </>
}