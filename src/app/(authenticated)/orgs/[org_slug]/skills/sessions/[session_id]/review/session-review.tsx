/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useMemo, useState } from 'react'
import * as R from 'remeda'

import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

import { S2_Button } from '@/components/ui/s2-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup } from '@/components/ui/field'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHead, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'
import { Heading, Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel, CompetenceLevelIndicator, CompetenceLevels, CompetenceLevelTerms } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonId } from '@/lib/schemas/person'
import { SkillId } from '@/lib/schemas/skill'
import { SkillCheckId } from '@/lib/schemas/skill-check'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { trpc } from '@/trpc/client'




export function SkillsModule_SessionReview({ organization,session }: { organization: OrganizationData, session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
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

    const [selectedChecks, setSelectedChecks] = useState<SkillCheckId[]>([])

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

   const sortedChecks = useMemo(() => {
        const result = checks.sort((a, b) => {
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

        return result.map((check, index) => {
            let assesseRowSpan = 0
            let skillRowSpan = 0
            let assessorRowSpan = 0

            if(check.assesseeId != prevAssesseeId) {
                // New assessee group
                prevAssesseeId = check.assesseeId
                prevSkillId = null
                prevAssessorId = null

                assesseRowSpan = R.pipe(result.slice(index),
                    R.takeWhile(c => c.assesseeId === check.assesseeId),
                    R.length()
                )
            }
            if(check.skillId != prevSkillId) {
                // New skill group within the same assessee
                prevSkillId = check.skillId
                prevAssessorId = null

                skillRowSpan = R.pipe(result.slice(index),
                    R.takeWhile(c => c.assesseeId === check.assesseeId && c.skillId === check.skillId),
                    R.length()
                )
            }
            if(check.assessorId != prevAssessorId) {
                // New assessor group within the same assessee and skill
                prevAssessorId = check.assessorId

                assessorRowSpan = R.pipe(result.slice(index),
                    R.takeWhile(c => c.assesseeId === check.assesseeId && c.skillId === check.skillId && c.assessorId === check.assessorId),
                    R.length()
                )
            }


            return { ...check, assesseRowSpan, skillRowSpan, assessorRowSpan }
        })

    }, [checks, distinctAssessees, distinctSkills, distinctAssessors])

    return <>
        <Heading level={3}>Review Skill Check Session</Heading>
        <Paragraph className="mb-4">
            {checks.length} skill checks have been completed in this session by {distinctAssessors.length} assessors for {distinctAssessees.length} assessees across {distinctSkills.length} skills. Please review the results below and select the skill checks to be included in the competency matrix.
        </Paragraph>
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground">
            <div className="font-semibold">Legend:</div>
            {CompetenceLevels.map(level => (
                <div key={level} className="flex items-center gap-1">
                    <CompetenceLevelIndicator level={level}/> {CompetenceLevelTerms[level]}
                </div>
            ))}
        </div>

        <S2_Table className="">
            <S2_TableHead className="w-full sticky top-0 bg-background z-5">
                <S2_TableRow className="rounded-md">
                    <S2_TableHeader>Assessee</S2_TableHeader>
                    <S2_TableHeader>Skill</S2_TableHeader>
                    <S2_TableHeader>Assessor</S2_TableHeader>
                    <S2_TableHeader className="text-center"></S2_TableHeader>
                    <S2_TableHeader></S2_TableHeader>
                </S2_TableRow>
            </S2_TableHead>
            <S2_TableBody className="bg-background">
                {checks.map(check => {
                    const assessee = distinctAssessees.find(a => a.personId === check.assesseeId)
                    const assessor = distinctAssessors.find(a => a.personId === check.assessorId)
                    const skill = distinctSkills.find(s => s.skillId === check.skillId)

                    return <S2_TableRow key={check.skillCheckId}>
                        <S2_TableCell rowSpan={1}>{assessee?.name}</S2_TableCell>
                        <S2_TableCell rowSpan={1}>{skill?.name}</S2_TableCell>
                        <S2_TableCell rowSpan={1}>{assessor?.name}</S2_TableCell>
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

        <FieldGroup>
            <Field orientation="horizontal" className="mt-4">
                <S2_Button 
                    disabled={selectedChecks.length === 0}
                    onClick={() => mutation.mutate({ 
                        orgId: organization.orgId, 
                        sessionId: session.sessionId, 
                        includedCheckIds: selectedChecks, 
                        excludedCheckIds: checks.map(c => c.skillCheckId).filter(id => !selectedChecks.includes(id)), 
                        sessionStatus: 'Include'
                    })}
                >Approve selected checks</S2_Button>
                <S2_Button variant="outline">Reset selection</S2_Button>
            </Field>
        </FieldGroup>
    </>
}