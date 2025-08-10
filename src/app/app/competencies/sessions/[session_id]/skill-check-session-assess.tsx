/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { CurrentPersonValue } from '@/components/controls/person-value'
import { Show } from '@/components/show'

import { AsyncButton, Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useSkillCheckSessionUpdater } from '@/hooks/use-skill-check-session-updater'
import { useToast } from '@/hooks/use-toast'
import { nanoId16,  } from '@/lib/id'
import { CompetenceLevelTerms, SkillCheckData } from '@/lib/schemas/skill-check'
import { useTRPC } from '@/trpc/client'




export function SkillCheckSession_Assess_Card({ sessionId }: { sessionId: string }) {
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
                    [...prev.filter(c => c.skillCheckId != data.skillCheckId), { ...data, assessorId: assessor.personId, sessionId, date: session.date }]
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
            <CardTitle>Assess Skill</CardTitle>
            <CardActions>
                <Select value="Single" disabled>
                    <SelectTrigger size="sm">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Single">
                            Single Mode
                        </SelectItem>
                        <SelectItem value="Person">
                            Person Mode
                        </SelectItem>
                        <SelectItem value="Skill">
                            Skill Mode
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Separator orientation="vertical"/>
                <CardExplanation>
                    This form allows you to assess a team member's skill during a session. Select the person being assessed, the skill, and the competence level.
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
                        control={<Select 
                            value={formData.assesseeId} 
                            onValueChange={assesseeId => handleChange({ assesseeId })}
                            disabled={modified}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a person to assess..." />
                            </SelectTrigger>
                            <SelectContent>
                                {assessees.map(assessee => (
                                    <SelectItem key={assessee.personId} value={assessee.personId} disabled={assessee.personId === assessor.personId}>
                                        {assessee.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>}
                    />
                    <ToruGridRow
                        label="Skill"
                        control={<Select 
                            value={formData.skillId} 
                            onValueChange={skillId => handleChange({ skillId })}
                            disabled={modified}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a skill to assess..." />
                            </SelectTrigger>
                            <SelectContent>
                                {skills.map(skill => (
                                    <SelectItem key={skill.skillId} value={skill.skillId}>
                                        {skill.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>}
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
                            <Button variant="ghost" size="sm" onClick={handleReset}>Reset</Button>
                        </Show>
                        
                    </ToruGridFooter>
                </ToruGrid>
            </Form>
        </CardContent>
    </Card>
}
