/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import * as R from 'remeda'


import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHead, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Heading, Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel, CompetenceLevelIndicator, CompetenceLevels, CompetenceLevelTerms } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonId, PersonRef } from '@/lib/schemas/person'
import { SkillId, SkillRef } from '@/lib/schemas/skill'
import { SkillCheckData, SkillCheckId } from '@/lib/schemas/skill-check'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { trpc } from '@/trpc/client'



export function SkillsModule_SessionReview({ organization,session }: { organization: OrganizationData, session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const [
        { data: distinctAssessees },
        { data: distinctAssessors },
        { data: distinctSkills },
        { data: checks },
    ] = useSuspenseQueries({
        queries: [
            trpc.skillChecks.getSessionDistinctAssessees.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionDistinctAssessors.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionDistinctSkills.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
        ]
    })

    const eligableChecks = checks.filter(c => c.result != 'NotAssessed')
    const previouslyApprovedCheckIds = eligableChecks.filter(c => c.checkStatus == 'Include').map(c => c.skillCheckId)
    const isDraft = session.sessionStatus == 'Draft'

    const [selectedChecks, setSelectedChecks] = useState<SkillCheckId[]>(previouslyApprovedCheckIds)
    const [sessionComplete, setSessionComplete] = useState(true)

    const mutation = useMutation(trpc.skillChecks.saveSessionReview.mutationOptions({
        onError(error) {
            toast({
                title: 'Error saving session review',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            toast({
                title: 'Session review saved',
                description: 'The skill check session review has been saved successfully.',
            })
            queryClient.invalidateQueries(trpc.skillChecks.getSession.queryFilter({ orgId: organization.orgId, sessionId: session.sessionId }))
            queryClient.invalidateQueries(trpc.skillChecks.getSessionChecks.queryFilter({ orgId: organization.orgId, sessionId: session.sessionId }))
        }
    }))

   const sortedChecks = useMemo(() => sortAndGroupChecks(eligableChecks, distinctAssessees, distinctAssessors, distinctSkills), [eligableChecks, distinctAssessees, distinctSkills, distinctAssessors])

    return <>
        <Heading level={3}>Review Skill Check Session</Heading>
        <Paragraph className="mb-4">
            { checks.length > 0
                ? `This session contains ${checks.length} skill checks completed by ${distinctAssessors.length} assessor(s) for ${distinctAssessees.length} assessee(s) across ${distinctSkills.length} skill(s).`
                : `No skill checks have been recorded in this session yet.`
            }
            <br/>
            { isDraft
                ? 'Please review the results below and select the skill checks to be included in the competency matrix.'
                : 'The session has been previously been reviewed and marked complete. You can update the included skill checks below.'
            }
        </Paragraph>
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground">
            <div className="font-semibold">Legend:</div>
            {CompetenceLevels.map(level => (
                <div key={level} className="flex items-center gap-1">
                    <CompetenceLevelIndicator level={level}/> {CompetenceLevelTerms[level]}
                </div>
            ))}
        </div>

        <S2_Table>
            <S2_TableHead className="w-full sticky top-0 bg-background z-5">
                <S2_TableRow className="rounded-md">
                    <S2_TableHeader>Assessee</S2_TableHeader>
                    <S2_TableHeader>Skill</S2_TableHeader>
                    <S2_TableHeader>Assessor</S2_TableHeader>
                    <S2_TableHeader className="text-center"></S2_TableHeader>
                    <S2_TableHeader>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Checkbox
                                    disabled={eligableChecks.length == 0}
                                    checked={
                                        (eligableChecks.length == 0 || selectedChecks.length === 0)
                                            ? false
                                            : selectedChecks.length == eligableChecks.length
                                                ? true
                                                : 'indeterminate'
                                                
                                    }
                                    onCheckedChange={checked => {
                                    if (checked) {
                                        setSelectedChecks(eligableChecks.map(c => c.skillCheckId))
                                    } else {
                                        setSelectedChecks([])
                                    }
                                }}/>
                            </TooltipTrigger>
                            <TooltipContent>
                                { selectedChecks.length == eligableChecks.length
                                    ? 'Deselect All'
                                    : 'Select All'
                                }
                            </TooltipContent>
                        </Tooltip>
                        
                    </S2_TableHeader>
                </S2_TableRow>
            </S2_TableHead>
            <S2_TableBody className="bg-background">
                {sortedChecks.map(check => {
                    const assessee = distinctAssessees.find(a => a.personId === check.assesseeId)
                    const assessor = distinctAssessors.find(a => a.personId === check.assessorId)
                    const skill = distinctSkills.find(s => s.skillId === check.skillId)

                    return <S2_TableRow key={check.skillCheckId}>
                        {check.assesseRowSpan > 0 && <S2_TableCell rowSpan={check.assesseRowSpan}>{assessee?.name}</S2_TableCell>}
                        {check.skillRowSpan > 0 && <S2_TableCell rowSpan={check.skillRowSpan}>{skill?.name}</S2_TableCell>}
                        {check.assessorRowSpan > 0 && <S2_TableCell rowSpan={check.assessorRowSpan}>{assessor?.name}</S2_TableCell>}
                        <S2_TableCell className="text-center">
                            <CompetenceLevelIndicator level={check.result as CompetenceLevel} />
                        </S2_TableCell>
                        <S2_TableCell className="px-2 py-0">
                            <Checkbox value={check.skillCheckId} checked={selectedChecks.includes(check.skillCheckId)} onCheckedChange={checked => {
                                if (checked) {
                                    setSelectedChecks(prev => [...prev, check.skillCheckId])
                                } else {
                                    setSelectedChecks(prev => prev.filter(id => id !== check.skillCheckId))
                                }
                            }}/>
                        </S2_TableCell>
                    </S2_TableRow>
                })}
            </S2_TableBody>
        </S2_Table>

        <FieldGroup className="mt-4">
            <Show when={isDraft}>
                <Field orientation="horizontal">
                    <Checkbox checked={sessionComplete} onCheckedChange={(newValue) => setSessionComplete(newValue == true)} />
                    <FieldLabel>Mark session as complete</FieldLabel>
                </Field>
            </Show>
            <Field orientation="horizontal">
                <S2_Button
                    disabled={eligableChecks.length == 0 || mutation.isPending}
                    onClick={() => mutation.mutate({ 
                        orgId: organization.orgId, 
                        sessionId: session.sessionId, 
                        includedCheckIds: selectedChecks, 
                        excludedCheckIds: checks.map(c => c.skillCheckId).filter(id => !selectedChecks.includes(id)), 
                        sessionStatus: sessionComplete ? 'Include' : 'Draft'
                    })}
                >{ isDraft ? 'Submit' : 'Update'}</S2_Button>

                <S2_Button 
                    variant="outline" 
                    onClick={() => setSelectedChecks([])}
                >Cancel</S2_Button>
            </Field>
        </FieldGroup>
    </>
}


type SkillCheckWithRowSpans = SkillCheckData & {
    assesseRowSpan: number
    skillRowSpan: number
    assessorRowSpan: number
}


function sortAndGroupChecks(eligableChecks: SkillCheckData[], distinctAssessees: PersonRef[], distinctAssessors: PersonRef[], distinctSkills: SkillRef[]): SkillCheckWithRowSpans[] {

    // Sort the checks by assessee, then by skill, then by assessor
    const sorted = eligableChecks.sort((a, b) => {
        const assesseeA = distinctAssessees.find(p => p.personId === a.assesseeId)?.name || ''
        const assesseeB = distinctAssessees.find(p => p.personId === b.assesseeId)?.name || ''
        if (assesseeA !== assesseeB) {
            return assesseeA.localeCompare(assesseeB)
        }
        const skillA = distinctSkills.find(s => s.skillId === a.skillId)?.name || ''
        const skillB = distinctSkills.find(s => s.skillId === b.skillId)?.name || ''
        if (skillA !== skillB) {
            return skillA.localeCompare(skillB)
        }
        const assessorA = distinctAssessors.find(p => p.personId === a.assessorId)?.name || ''
        const assessorB = distinctAssessors.find(p => p.personId === b.assessorId)?.name || ''
        return assessorA.localeCompare(assessorB)
    })


    let prevAssesseeId: PersonId | null = null
    let prevSkillId: SkillId | null = null
    let prevAssessorId: PersonId | null = null

    return sorted.map((check, index) => {
        let assesseRowSpan = 0
        let skillRowSpan = 0
        let assessorRowSpan = 0

        if(check.assesseeId != prevAssesseeId) {
            // New assessee group
            prevAssesseeId = check.assesseeId
            prevSkillId = null
            prevAssessorId = null

            assesseRowSpan = R.pipe(sorted.slice(index),
                R.takeWhile(c => c.assesseeId === check.assesseeId),
                R.length()
            )
        }
        if(check.skillId != prevSkillId) {
            // New skill group within the same assessee
            prevSkillId = check.skillId
            prevAssessorId = null

            skillRowSpan = R.pipe(sorted.slice(index),
                R.takeWhile(c => c.assesseeId === check.assesseeId && c.skillId === check.skillId),
                R.length()
            )
        }
        if(check.assessorId != prevAssessorId) {
            // New assessor group within the same assessee and skill
            prevAssessorId = check.assessorId

            assessorRowSpan = R.pipe(sorted.slice(index),
                R.takeWhile(c => c.assesseeId === check.assesseeId && c.skillId === check.skillId && c.assessorId === check.assessorId),
                R.length()
            )
        }

        return { ...check, assesseRowSpan, skillRowSpan, assessorRowSpan }
    })
}