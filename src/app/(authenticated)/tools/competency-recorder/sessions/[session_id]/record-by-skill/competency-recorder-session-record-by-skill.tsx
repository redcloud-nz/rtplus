/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

/* eslint-disable */
'use client'

import { useState } from 'react'

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'


import { AsyncButton, Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { CompetenceLevelTerms } from '@/lib/competencies'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { useTRPC } from '@/trpc/client'



export function CompetencyRecorder_Session_RecordBySkill_Card({ sessionId }: { sessionId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: session } = useSuspenseQuery(trpc.skillCheckSessions.getSession.queryOptions({ sessionId }))
    const { data: assessor } = useSuspenseQuery(trpc.currentUser.getPerson.queryOptions())
    const { data: assessees } = useSuspenseQuery(trpc.skillCheckSessions.getAssessees.queryOptions({ sessionId }))
    const { data: skills } = useSuspenseQuery(trpc.skillCheckSessions.getSkills.queryOptions({ sessionId }))
    const { data: checks } = useSuspenseQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId }))

    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)

    const [prevData, setPrevData] = useState<Pick<SkillCheckData, 'assesseeId' | 'result' | 'notes'>[]| null>(null)

    function handleChangeSkill(skillId: string) {
        setSelectedSkillId(skillId)

        if(skillId) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const existingChecks = checks.filter(check => check.skillId === skillId && check.assessorId === assessor.personId)

            // TODO Setup form data
        }
    }

    function handleReset() {

    }

    //const sessionUpdater = useSkillCheckSessionUpdater(queryClient)


    return <Card>
        <CardHeader>
            <CardTitle>Record By Skill</CardTitle>
            <CardActions>
                <Select
                    value={selectedSkillId ?? ''} 
                    onValueChange={handleChangeSkill}
                >
                    <SelectTrigger size="sm">
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
                <Separator orientation="vertical"/>
                <CardExplanation>
                    <div>This form allows you to record multiple checks for a particular skill within the session.</div>
                    
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            <Form>
                <div className="grid grid-cols-[min(20%,--spacing(80))_1fr_1fr">
                    {assessees.map(assessee => (
                        <div className="col-span-3 grid grid-cols-subgrid border-t border-zinc-950/5 py-1 first:border-none md:gap-2">
                            <Label className="pt-3 pl-2">{assessee.name}</Label>
                            <div>
                                <Select defaultValue="NotAssessed" disabled={selectedSkillId == null}>
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                        {Object.entries(CompetenceLevelTerms).map(([key, label]) =>
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Notes..."
                                    maxLength={500}
                                    disabled={selectedSkillId == null}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="h-10 pt-1 flex items-center gap-2 col-span-full border-t border-zinc-950/5">
                        <AsyncButton
                            size="sm"
                            label={prevData ? "Update" : "Save"}
                            pending={prevData ? "Updating..." : "Saving..."}
                        />
                        <Button variant="ghost" size="sm" onClick={handleReset}>Clear</Button>
                    </div>
                </div>
            </Form>
        </CardContent>
    </Card>
}