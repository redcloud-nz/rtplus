/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useMemo, useState } from 'react'
import { pick } from 'remeda'

import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

import { FloatingFooter } from '@/components/footer'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CompetenceLevelRadioGroup } from '@/components/ui/competence-level-radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Paragraph } from '@/components/ui/typography'

import { getAssignedSkills } from '@/hooks/use-assigned-skills'
import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel, isPass } from '@/lib/competencies'
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
}

const EmptyRecordingState: RecordingState = {
    prevData: null,
    target: { assesseeId: null, skillId: null },
    data: null,
    dirty: false
}

export function SkillRecorder_Session_RecordSingle({ session }: { session: SkillCheckSessionData }) {

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
            trpc.personnel.getCurrentPerson.queryOptions(),
            trpc.skills.getAvailablePackages.queryOptions({ }),
            trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ sessionId: session.sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ sessionId: session.sessionId, assessorId: 'me' }),
            trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ sessionId: session.sessionId })
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
                    dirty: false
                }))
            } else {
                // We don't have an existing check, reset the form
                setState(({ 
                    prevData: null, 
                    target: { assesseeId, skillId }, 
                    data: { skillCheckId: SkillCheckId.create(), result: '', notes: '' },
                    dirty: false
                }))
            }
        } else {
            setState(EmptyRecordingState)
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

    function handleReset() {
        setState(EmptyRecordingState)
    }

    const queryKey = trpc.skillChecks.getSessionChecks.queryKey({ sessionId: session.sessionId, assessorId: 'me' })
    const queryFilter = trpc.skillChecks.getSessionChecks.queryFilter({ sessionId: session.sessionId, assessorId: 'me' })


    const mutation = useMutation(trpc.skillChecks.saveSessionCheck.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(queryFilter)

            const previousChecks = queryClient.getQueryData(queryKey)

            if (previousChecks) {
                const skillCheck = skillCheckSchema.parse({ ...data, assessorId: assessor.personId, passed: isPass(data.result as CompetenceLevel), date: session.date, timestamp: new Date().toISOString(), checkStatus: 'Draft' })

                queryClient.setQueryData(queryKey, (prev = []) => 
                    // Update or add the skill check
                    [...prev.filter(c => c.skillCheckId != data.skillCheckId), skillCheck]
                )
            }

            handleReset()

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

    return <ScrollArea style={{ height: `calc(100vh - var(--header-height) - 56px)` }}>

        <form className="space-y-4 px-4 pt-2">
            {/* <div>
                <Label>Assessor</Label>
                <div>
                    <CurrentPersonValue />
                </div>
            </div> */}
            <div className="space-y-1">
                <Label>1. Assessee</Label>
                <div>
                    <Show 
                        when={assessees.length > 0}
                        fallback={<Alert title="No assessees defined" severity="warning" className="p-2.5"/>}
                    >
                        <Select
                            value={state.target.assesseeId ?? ''} 
                            onValueChange={newValue => handleChangeTarget({ assesseeId: newValue as PersonId, skillId: state.target.skillId })}
                            disabled={state.dirty}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a person..."/>
                            </SelectTrigger>
                            <SelectContent>
                                                            
                                {assessees.map(assessee => (
                                    <SelectItem key={assessee.personId} value={assessee.personId} disabled={assessee.personId === assessor.personId}>
                                        {assessee.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Show>
                </div>
                
            </div>
            <div className="space-y-1">
                <Label>2. Skill</Label>
                <div>
                    <Show 
                        when={skills.length > 0}
                        fallback={<Alert title="No skills defined" severity="warning" className="p-2.5"/>}
                    >
                        <Select
                            value={state.target.skillId ?? ''} 
                            onValueChange={newValue => handleChangeTarget({ assesseeId: state.target.assesseeId, skillId: newValue as SkillId })}
                            disabled={state.dirty}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a skill..."/>
                            </SelectTrigger>
                            <SelectContent>
                                {skills.map(skill => (
                                    <SelectItem key={skill.skillId} value={skill.skillId}>
                                        {skill.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Show>
                    
                </div>
            </div>
            {skill && <Paragraph className="text-sm text-muted-foreground">{skill.description}</Paragraph>}
            <Show when={state.data != null}>
                <div className="space-y-1">
                    <Label>3. Competence Level</Label>
                    <div>
                        {/* <Select
                            value={state.data?.result || ''} 
                            onValueChange={result => handleUpdateFormData({ result, notes: state.data?.notes || '' })}
                            disabled={state.data == null}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a competene level..."/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectContent>
                                    {Object.entries(CompetenceLevelTerms).map(([key, label]) =>
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                )}
                            </SelectContent>
                            </SelectContent>
                        </Select> */}
                        <CompetenceLevelRadioGroup
                            className="py-2"
                            value={state.data?.result as CompetenceLevel}
                            prevValue={state.prevData?.result as CompetenceLevel || null}
                            onValueChange={newValue => handleUpdateFormData({ result: newValue, notes: state.data?.notes || '' })}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label>4. Notes <span className="text-muted-foreground">(optional)</span></Label>
                    <div>
                        <Textarea 
                            value={state.data?.notes || ''} 
                            onChange={e => handleUpdateFormData({ result: state.data?.result || '', notes: e.target.value })} 
                            maxLength={500}
                            disabled={state.data == null}
                        />
                    </div>
                </div>
            </Show>
        </form>
        
        <FloatingFooter open={state.dirty || mutation.isPending}>
            <Button
                size="sm"
                color="blue"
                onClick={() => mutation.mutate({ sessionId: session.sessionId, skillId: state.target.skillId!, assesseeId: state.target.assesseeId!, ...state.data! })}
                disabled={!state.dirty}
            >Save</Button>
            <Button 
                size="sm"
                color="red" 
                onClick={handleReset}
            >Reset</Button>
        </FloatingFooter>
    </ScrollArea>
}
