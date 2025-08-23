/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useState } from 'react'
import { pick } from 'remeda'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { CurrentPersonValue } from '@/components/controls/person-value'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { AsyncButton, Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel, CompetenceLevelTerms, isPass } from '@/lib/competencies'
import { nanoId16  } from '@/lib/id'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { useTRPC } from '@/trpc/client'


type RecordingState = {
    prevData: SkillCheckData | null
    target: { assesseeId: string, skillId: string }
    data: Pick<SkillCheckData,  'skillCheckId' | 'result' | 'notes'> | null
    dirty: boolean
}

export function CompetencyRecorder_Session_RecordIndividual_Card({ sessionId }: { sessionId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: session } = useSuspenseQuery(trpc.skillCheckSessions.getSession.queryOptions({ sessionId }))
    const { data: assessor } = useSuspenseQuery(trpc.currentUser.getPerson.queryOptions())
    const { data: assessees } = useSuspenseQuery(trpc.skillCheckSessions.getAssessees.queryOptions({ sessionId }))
    const { data: skills } = useSuspenseQuery(trpc.skillCheckSessions.getSkills.queryOptions({ sessionId }))
    const { data: existingChecks } = useSuspenseQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId, assessorId: 'me' }))

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


    const mutation = useMutation(trpc.skillCheckSessions.saveCheck.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.getChecks.queryFilter({ sessionId }))

            const previousChecks = queryClient.getQueryData(trpc.skillCheckSessions.getChecks.queryKey({ sessionId }))

            if (previousChecks) {
                queryClient.setQueryData(trpc.skillCheckSessions.getChecks.queryKey({ sessionId }), (prev = []) => 
                    // Update or add the skill check
                    [...prev.filter(c => c.skillCheckId != data.skillCheckId), { ...data, assessorId: assessor.personId, passed: isPass(data.result as CompetenceLevel), sessionId, date: session.date, timestamp: new Date().toISOString(), teamId: session.teamId }]
                )
            }

            handleReset()

            return { previousChecks }
        },
        onError(error, data, context) {
            // Rollback to previous state
            queryClient.setQueryData(trpc.skillCheckSessions.getChecks.queryKey({ sessionId }), context?.previousChecks)

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
            
            queryClient.invalidateQueries(trpc.skillCheckSessions.getChecks.queryFilter({ sessionId, assessorId: 'me' }))
        },
        
    }))

    return <Card>
        <CardHeader>
            <CardTitle>Record Check</CardTitle>
            <CardActions>

                <Separator orientation="vertical"/>
                <CardExplanation>
                    <div>This form allows you to record a skill check for an individual within the session.</div>
                    <div>Steps</div>
                    <ol className="list-decimal pl-4">
                        <li>Select the person being assessed and the skill they are being assessed on.</li>
                        <li>Choose the competence level and provide any additional notes.</li>
                        <li>Save the skill check.</li>
                    </ol>
                    
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            <Form>
                <ToruGrid>
                    <ToruGridRow
                        label="Assessor"
                        control={<CurrentPersonValue/>}
                    />
                    <ToruGridRow
                        label="Assessee"
                        control={assessees.length > 0
                            ? <Select 
                            value={state.target.assesseeId} 
                            onValueChange={newValue => handleChangeTarget({ assesseeId: newValue, skillId: state.target.skillId })}
                            disabled={state.dirty}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a person..." />
                            </SelectTrigger>
                            <SelectContent>
                                
                                {assessees.map(assessee => (
                                    <SelectItem key={assessee.personId} value={assessee.personId} disabled={assessee.personId === assessor.personId}>
                                        {assessee.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        : <Alert title="No assessees defined" severity="warning" className="p-2.5"/>

                        }
                    />
                    <ToruGridRow
                        label="Skill"
                        control={skills.length > 0
                            ? <Select 
                                value={state.target.skillId} 
                                onValueChange={newValue => handleChangeTarget({ assesseeId: state.target.assesseeId, skillId: newValue })}
                                disabled={state.dirty}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a skill..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {skills.map(skill => (
                                        <SelectItem key={skill.skillId} value={skill.skillId}>
                                            {skill.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            : <Alert title="No skills defined" severity="warning" className="p-2.5"/>
                        }
                    />
                    <ToruGridRow
                        label="Competence Level"
                        control={
                            <Select 
                                value={state.data?.result || ''} 
                                onValueChange={result => handleUpdateFormData({ result, notes: state.data?.notes || '' })}
                                disabled={state.data == null}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select competence level ..."/>
                                </SelectTrigger>
                                <SelectContent>
                                        {Object.entries(CompetenceLevelTerms).map(([key, label]) =>
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        }
                    />
                    <ToruGridRow
                        label="Notes"
                        control={<Textarea 
                            value={state.data?.notes || ''} 
                            onChange={e => handleUpdateFormData({ result: state.data?.result || '', notes: e.target.value })} 
                            maxLength={500}
                            disabled={state.data == null}
                        />}
                    />
                    <ToruGridFooter>
                        <Show when={state.data != null}>
                            <AsyncButton
                                size="sm"
                                onClick={() => mutation.mutateAsync({ sessionId, ...state.target, ...state.data! })}
                                label={state.prevData ? "Update" : "Save"}
                                pending={state.prevData ? "Updating..." : "Saving..."}
                                disabled={!state.dirty}
                            />
                            <Button variant="ghost" size="sm" onClick={handleReset}>Clear</Button>
                        </Show>
                        
                    </ToruGridFooter>
                </ToruGrid>
            </Form>
        </CardContent>
    </Card>
}
