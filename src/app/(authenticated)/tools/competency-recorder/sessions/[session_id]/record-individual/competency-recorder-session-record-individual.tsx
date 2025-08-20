/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useState } from 'react'

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

import { useSkillCheckSessionUpdater } from '@/hooks/use-skill-check-session-updater'
import { useToast } from '@/hooks/use-toast'
import { CompetenceLevelTerms } from '@/lib/competencies'
import { nanoId16,  } from '@/lib/id'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { useTRPC } from '@/trpc/client'




export function CompetencyRecorder_Session_RecordIndividual_Card({ sessionId }: { sessionId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: session } = useSuspenseQuery(trpc.skillCheckSessions.getSession.queryOptions({ sessionId }))
    const { data: assessor } = useSuspenseQuery(trpc.currentUser.getPerson.queryOptions())
    const { data: assessees } = useSuspenseQuery(trpc.skillCheckSessions.getAssessees.queryOptions({ sessionId }))
    const { data: skills } = useSuspenseQuery(trpc.skillCheckSessions.getSkills.queryOptions({ sessionId }))
    const { data: checks } = useSuspenseQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId }))

    const [prevData, setPrevData] = useState<SkillCheckData | null>(null)
    const [formData, setFormData] = useState<Pick<SkillCheckData, 'assesseeId' | 'skillId' | 'result' | 'notes' | 'skillCheckId'>>({ assesseeId: '', skillId: '', result: '', notes: '', skillCheckId: nanoId16() })

    function handleChange({ assesseeId = formData.assesseeId, skillId = formData.skillId }: { assesseeId?: string, skillId?: string }) {
        setFormData(prev => ({ ...prev, assesseeId, skillId }))

        if( assesseeId && skillId ) {
            const check = checks.find(c => c.assesseeId === assesseeId && c.skillId === skillId)
            if( check ) {
                setPrevData(check)
                setFormData(prev => ({ ...prev, skillCheckId: check.skillCheckId, result: check.result, notes: check.notes }))
            }
        }
    }

    function handleReset() {
        setPrevData(null)
        setFormData({ assesseeId: '', skillId: '', result: '', notes: '', skillCheckId: nanoId16() })
    }

    const sessionUpdater = useSkillCheckSessionUpdater(queryClient)

    const mutation = useMutation(trpc.skillCheckSessions.saveCheck.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.getChecks.queryFilter({ sessionId }))

            const previousChecks = queryClient.getQueryData(trpc.skillCheckSessions.getChecks.queryKey({ sessionId }))

            if (previousChecks) {
                queryClient.setQueryData(trpc.skillCheckSessions.getChecks.queryKey({ sessionId }), (prev = []) => 
                    // Update or add the skill check
                    [...prev.filter(c => c.skillCheckId != data.skillCheckId), { ...data, assessorId: assessor.personId, sessionId, date: session.date, timestamp: new Date().toISOString(), teamId: session.teamId }]
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
        onSuccess(result) {
            toast({
                title: 'Skill check saved',
                description: "Your skill check has been successfully saved.",
            })
            
            sessionUpdater.updateSession(result.session)
        },
        
    }))

    // Check if both assessee and skill are selected
    const checkDefined = !!formData.assesseeId && !!formData.skillId

    // Determine if the result or notes have been modified
    const modified = checkDefined && (
        (prevData ? formData.result != prevData.result : !!formData.result) ||
        (prevData ? formData.notes != prevData.notes : !!formData.notes)
    )

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
                            value={formData.assesseeId} 
                            onValueChange={assesseeId => handleChange({ assesseeId })}
                            disabled={modified}
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
                                value={formData.skillId} 
                                onValueChange={skillId => handleChange({ skillId })}
                                disabled={modified}
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
                                value={formData.result} 
                                onValueChange={result => setFormData(prev => ({ ...prev, result }))}
                                disabled={!checkDefined}
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
                            value={formData.notes} 
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
                            maxLength={500}
                            disabled={!checkDefined}
                        />}
                    />
                    <ToruGridFooter>
                        <Show when={checkDefined}>
                            <AsyncButton
                                size="sm"
                                onClick={() => mutation.mutateAsync({ sessionId, ...formData })}
                                label={prevData ? "Update" : "Save"}
                                pending={prevData ? "Updating..." : "Saving..."}
                                disabled={formData.result == ''}
                            />
                            <Button variant="ghost" size="sm" onClick={handleReset}>Clear</Button>
                        </Show>
                        
                    </ToruGridFooter>
                </ToruGrid>
            </Form>
        </CardContent>
    </Card>
}
