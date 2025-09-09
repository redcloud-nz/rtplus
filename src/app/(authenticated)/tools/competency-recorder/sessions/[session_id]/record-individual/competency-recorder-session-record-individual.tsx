/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useMemo, useState } from 'react'
import { pick } from 'remeda'

import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

import { CurrentPersonValue } from '@/components/controls/person-value'
import { InjectFooter } from '@/components/footer'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { AsyncButton, Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { getAssignedSkills } from '@/hooks/use-assigned-skills'
import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel, CompetenceLevelTerms, isPass } from '@/lib/competencies'
import { nanoId16  } from '@/lib/id'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { useTRPC } from '@/trpc/client'



type RecordingState = {
    prevData: SkillCheckData | null
    target: { assesseeId: string, skillId: string }
    data: Pick<SkillCheckData,  'skillCheckId' | 'result' | 'notes'> | null
    dirty: boolean
}

export function CompetencyRecorder_Session_RecordIndividual_PageContent({ session }: { session: SkillCheckSessionData}) {
    const { sessionId } = session

    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const [{ data: assessor }, { data: availablePackages }, { data: assessees }, { data: existingChecks }, { data: assignedSkillIds }] = useSuspenseQueries({
        queries: [
            trpc.currentUser.getPerson.queryOptions(),
            trpc.skills.getAvailablePackages.queryOptions(),
            trpc.skillChecks.getSessionAssessees.queryOptions({ sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ sessionId, assessorId: 'me' }),
            trpc.skillChecks.getSessionSkillIds.queryOptions({ sessionId })
        ]
    })

    const skills = useMemo(() => getAssignedSkills(availablePackages, assignedSkillIds), [availablePackages, assignedSkillIds])

    const [state, setState] = useState<RecordingState>({
        prevData: null,
        target: { assesseeId: '', skillId: '' },
        data: null,
        dirty: false
    })

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
                    data: { skillCheckId: nanoId16(), result: '', notes: '' },
                    dirty: false
                }))
            }
        } else {
            setState(({ prevData: null, target: { assesseeId, skillId }, data: null, dirty: false }))
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
        setState(({ prevData: null, target: { assesseeId: '', skillId: '' }, data: null, dirty: false }))
    }


    const mutation = useMutation(trpc.skillChecks.saveSessionCheck.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.skillChecks.getSessionChecks.queryFilter({ sessionId, assessorId: 'me' }))

            const previousChecks = queryClient.getQueryData(trpc.skillChecks.getSessionChecks.queryKey({ sessionId, assessorId: 'me' }))

            if (previousChecks) {
                queryClient.setQueryData(trpc.skillChecks.getSessionChecks.queryKey({ sessionId }), (prev = []) => 
                    // Update or add the skill check
                    [...prev.filter(c => c.skillCheckId != data.skillCheckId), { ...data, assessorId: assessor.personId, passed: isPass(data.result as CompetenceLevel), sessionId, date: session.date, timestamp: new Date().toISOString(), teamId: session.teamId }]
                )
            }

            handleReset()

            return { previousChecks }
        },
        onError(error, _data, context) {
            // Rollback to previous state
            queryClient.setQueryData(trpc.skillChecks.getSessionChecks.queryKey({ sessionId }), context?.previousChecks)

            toast({
                title: 'Error saving skill check',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess() {
            toast({
                title: 'Skill check saved',
                description: "Your skill check has been successfully saved.",
            })
            
            queryClient.invalidateQueries(trpc.skillChecks.getSessionChecks.queryFilter({ sessionId, assessorId: 'me' }))
        },
        
    }))

    return <>
            {/* <CompetencyRecorder_Session_RecordIndividual_Card sessionId={session.sessionId} /> */}
            {/* <CompetencyRecorder_Session_Recent sessionId={session.sessionId} /> */}

        <form className="space-y-4 pl-4 pr-3 pt-2">
            <div>
                <Label>Assessor</Label>
                <div>
                    <CurrentPersonValue />
                </div>
            </div>
            <div>
                <Label>Assessee</Label>
                <div>
                    <Show 
                        when={assessees.length > 0}
                        fallback={<Alert title="No assessees defined" severity="warning" className="p-2.5"/>}
                    >
                        <Select
                            value={state.target.assesseeId} 
                            onValueChange={newValue => handleChangeTarget({ assesseeId: newValue, skillId: state.target.skillId })}
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
                <Label>Skill</Label>
                <div>
                    <Show 
                        when={skills.length > 0}
                        fallback={<Alert title="No skills defined" severity="warning" className="p-2.5"/>}
                    >
                        <Select
                            value={state.target.skillId} 
                            onValueChange={newValue => handleChangeTarget({ assesseeId: state.target.assesseeId, skillId: newValue })}
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
            <div>
                <Label>Competency Level</Label>
                <div>
                    <Select
                        value={state.data?.result || ''} 
                        onValueChange={result => handleUpdateFormData({ result, notes: state.data?.notes || '' })}
                        disabled={state.data == null}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a competency level..."/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectContent>
                                {Object.entries(CompetenceLevelTerms).map(([key, label]) =>
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            )}
                        </SelectContent>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label>Notes</Label>
                <div>
                    <Textarea 
                        value={state.data?.notes || ''} 
                        onChange={e => handleUpdateFormData({ result: state.data?.result || '', notes: e.target.value })} 
                        maxLength={500}
                        disabled={state.data == null}
                    />
                </div>
            </div>

        </form>
        <InjectFooter>
            <div className="flex gap-2">
                <AsyncButton
                    size="sm" reset
                    onClick={() => mutation.mutateAsync({ sessionId, ...state.target, ...state.data! })}
                    label={state.prevData ? "Update" : "Save"}
                    pending={state.prevData ? "Updating..." : "Saving..."}
                    disabled={!state.dirty}
                />
                <Button variant="ghost" size="sm" onClick={handleReset}>Clear</Button>
            </div>
        </InjectFooter>
    </>
}
