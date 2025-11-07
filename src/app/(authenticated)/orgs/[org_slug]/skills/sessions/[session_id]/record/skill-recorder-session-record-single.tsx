/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useMemo, useState } from 'react'
import { pick } from 'remeda'

import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

import { Show } from '@/components/show'


import { CompetenceLevelRadioGroup } from '@/components/controls/competence-level-radio-group'
import { S2_Button } from '@/components/ui/s2-button'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { S2_Textarea } from '@/components/ui/s2-textarea'
import { Paragraph } from '@/components/ui/typography'

import { getAssignedSkills } from '@/hooks/use-assigned-skills'
import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel, isPass } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonId } from '@/lib/schemas/person'
import { SkillId } from '@/lib/schemas/skill'
import { SkillCheckData, SkillCheckId, skillCheckSchema } from '@/lib/schemas/skill-check'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { trpc } from '@/trpc/client'




type RecordingState = {
    prevData: SkillCheckData | null
    target: { assesseeId: PersonId | null, skillId: SkillId | null }
    data: Pick<SkillCheckData, 'skillCheckId' | 'result' | 'notes'> | null
    dirty: boolean
    reset: boolean
}

const EmptyRecordingState: RecordingState = {
    prevData: null,
    target: { assesseeId: null, skillId: null },
    data: null,
    dirty: false,
    reset: false
}

export function SkillRecorder_Session_RecordSingle({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {

    const queryClient = useQueryClient()
    const { toast } = useToast()

    const [
        { data: assessor },
        { data: availablePackages }, 
        { data: assessees }, 
        { data: existingChecks }, 
        { data: assignedSkillIds }
    ] = useSuspenseQueries({
        queries: [
            trpc.personnel.getCurrentPerson.queryOptions({ orgId: organization.orgId }),
            trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }),
            trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId, assessorId: 'me' }),
            trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId })
        ]
    })

    const skills = useMemo(() => getAssignedSkills(availablePackages, assignedSkillIds), [availablePackages, assignedSkillIds])

    const [state, setState] = useState<RecordingState>(EmptyRecordingState)

    const skill = skills.find(s => s.skillId === state.target.skillId)

    function handleChangeTarget({ assesseeId, skillId }: RecordingState['target']) {

        if (assesseeId && skillId) {
            // Both assessee and skill are selected
            const existingCheck = existingChecks.find(c => c.assesseeId === assesseeId && c.skillId === skillId)
            if(existingCheck) {
                // We have an existing check for this combination
                setState(({ 
                    prevData: existingCheck, 
                    target: { assesseeId, skillId }, 
                    data: pick(existingCheck, ['skillCheckId', 'result', 'notes']),
                    dirty: false, reset: false
                }))
            } else {
                // We don't have an existing check, reset the form
                setState(({ 
                    prevData: null, 
                    target: { assesseeId, skillId }, 
                    data: { skillCheckId: SkillCheckId.create(), result: '', notes: '' },
                    dirty: false, reset: false
                }))
            }
        } else {
            setState({ ...EmptyRecordingState, target: { assesseeId, skillId } } )
        }
    }

    function handleUpdateFormData({ result, notes }: { result: string, notes: string}) {
        setState(prev => ({
            ...prev,
            data: { skillCheckId: prev.data!.skillCheckId, result, notes },
            dirty: prev.prevData 
                ? prev.prevData.result != result || prev.prevData.notes != notes 
                : result != '' || notes != ''
        }))
    }

    function handleReset({  target: partialTarget = {}, ...partialState }: Partial<Omit<RecordingState, 'target'> & { target?: Partial<RecordingState['target']> }> = {}) {
        setState({ ...EmptyRecordingState, target: { ...EmptyRecordingState.target, ...partialTarget }, ...partialState })
    }

    const queryKey = trpc.skillChecks.getSessionChecks.queryKey({ sessionId: session.sessionId, assessorId: 'me' })
    const queryFilter = trpc.skillChecks.getSessionChecks.queryFilter({ sessionId: session.sessionId, assessorId: 'me' })


    const mutation = useMutation(trpc.skillChecks.saveSessionCheck.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(queryFilter)

            const previousChecks = queryClient.getQueryData(queryKey)

            if (previousChecks) {
                const skillCheck = skillCheckSchema.parse({ ...data, assessorId: assessor?.personId, passed: isPass(data.result as CompetenceLevel), date: session.date, timestamp: new Date().toISOString(), checkStatus: 'Draft' })

                queryClient.setQueryData(queryKey, (prev = []) => 
                    // Update or add the skill check
                    [...prev.filter(c => c.skillCheckId != data.skillCheckId), skillCheck]
                )
            }

            setState(prev => ({ ...prev, reset: true }))

            return { previousChecks }
        },
        onError(error, _data, context) {
            // Rollback to previous state
            queryClient.setQueryData(queryKey, context?.previousChecks)

            toast({
                title: 'Error saving skill check',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess() {
            queryClient.invalidateQueries(queryFilter)
        },
        
    }))

    return <form className="py-4">
        <FieldGroup>
            <Field 
                data-invalid={assessees.length == 0}
                orientation="responsive"
            >
                <FieldContent>
                    <FieldLabel>Assessee</FieldLabel>
                    <FieldDescription>Select the person being assessed</FieldDescription>
                    {assessees.length == 0 && <FieldError>No assessees configured in this session.</FieldError>}
                </FieldContent>
                
                <S2_Select
                    value={state.target.assesseeId ?? ''} 
                    onValueChange={newValue => handleChangeTarget({ assesseeId: newValue as PersonId, skillId: state.target.skillId })}
                    disabled={state.dirty}
                >
                    <S2_SelectTrigger className="min-w-1/2" aria-invalid={assessees.length == 0}>
                        <S2_SelectValue placeholder="Select a person..."/>
                    </S2_SelectTrigger>
                    <S2_SelectContent>
                                                    
                        {assessees.map(assessee => (
                            <S2_SelectItem key={assessee.personId} value={assessee.personId} disabled={assessee.personId === assessor?.personId}>
                                {assessee.name}
                            </S2_SelectItem>
                        ))}
                    </S2_SelectContent>
                </S2_Select>
            </Field>
            <Field orientation="responsive">
                <FieldContent>
                    <FieldLabel>Skill</FieldLabel>
                    <FieldDescription>Select the skill being assessed</FieldDescription>
                </FieldContent>
                <S2_Select
                    value={state.target.skillId ?? ''} 
                    onValueChange={newValue => handleChangeTarget({ assesseeId: state.target.assesseeId, skillId: newValue as SkillId })}
                    disabled={state.dirty}
                >
                    <S2_SelectTrigger className="min-w-1/2">
                        <S2_SelectValue placeholder="Select a skill..."/>
                    </S2_SelectTrigger>
                    <S2_SelectContent>
                        {skills.map(skill => (
                            <S2_SelectItem key={skill.skillId} value={skill.skillId}>
                                {skill.name}
                            </S2_SelectItem>
                        ))}
                    </S2_SelectContent>
                </S2_Select>
            </Field>

            <FieldSeparator />
            
            {state.data != null && (
                state.reset 
                ? <>
                    <Field orientation="horizontal" className="justify-center">
                        <S2_Button onClick={() => handleReset({ target: { skillId: state.target.skillId } })}>Next Assessee</S2_Button>
                        <S2_Button onClick={() => handleReset({ target: { assesseeId: state.target.assesseeId } })}>Next Skill</S2_Button>
                        <S2_Button variant="outline" onClick={() => handleReset()}>Clear</S2_Button>
                    </Field>
                </>
                : <>
                     <Field orientation="responsive">
                        <FieldLabel>Skill Description</FieldLabel>
                        <Paragraph className='min-w-1/2'>{skill?.description}</Paragraph>
                    </Field>
                    <FieldSeparator />
                    
                    <Field orientation="responsive">
                        <FieldContent>
                            <FieldLabel>Competency Level</FieldLabel>
                        </FieldContent>
                        <CompetenceLevelRadioGroup
                            className="min-w-1/2"
                            value={state.data?.result as CompetenceLevel}
                            prevValue={state.prevData?.result as CompetenceLevel || null}
                            onValueChange={newValue => handleUpdateFormData({ result: newValue, notes: state.data?.notes || '' })}
                        />
                    </Field>
                    <Field orientation="responsive">
                        <FieldContent>
                            <FieldLabel>Assessor Comments</FieldLabel>
                            <FieldDescription>Any comments about the assessment</FieldDescription>
                        </FieldContent>
                        <S2_Textarea 
                            className="min-w-1/2"
                            value={state.data?.notes || ''} 
                            onChange={e => handleUpdateFormData({ result: state.data?.result || '', notes: e.target.value })} 
                            maxLength={500}
                            disabled={state.data == null}
                        />
                    </Field>

                    <Field orientation="horizontal">
                        <S2_Button
                            onClick={() => mutation.mutate({ orgId: organization.orgId, sessionId: session.sessionId, skillId: state.target.skillId!, assesseeId: state.target.assesseeId!, ...state.data! })}
                            disabled={!state.dirty || mutation.isPending}
                        >Save</S2_Button>
                        <S2_Button
                            variant="outline"
                            onClick={() => handleReset()}
                        >Clear</S2_Button>
                    </Field>
                </>
            )}
        </FieldGroup>
    </form>
}
