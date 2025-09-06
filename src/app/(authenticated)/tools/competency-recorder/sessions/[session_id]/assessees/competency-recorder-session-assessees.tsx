/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { AppPageContent, AppPageFooter } from '@/components/app-page'

import { AsyncButton, Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useToast } from '@/hooks/use-toast'
import { TeamData } from '@/lib/schemas/team'
import { useTRPC } from '@/trpc/client'


export default function CompetencyRecorder_Session_Assessees_PageContents({ sessionId, team }: { sessionId: string, team: TeamData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: assignedAssessees } = useSuspenseQuery(trpc.skillChecks.getSessionAssessees.queryOptions({ sessionId}))

    const [selectedAssessees, setSelectedAssessees] = useState<string[]>(assignedAssessees.map(a => a.personId))
    const [changes, setChanges] = useState<{ added: string[], removed: string[] }>({ added: [], removed: [] })

    function handleReset() {
        setSelectedAssessees(assignedAssessees.map(a => a.personId))
        setChanges({ added: [], removed: [] })
    }

    const mutation = useMutation(trpc.skillChecks.updateSessionAssessees.mutationOptions({
        async onMutate({ additions, removals }) {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries(trpc.skillChecks.getSessionAssessees.queryFilter({ sessionId }))

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }))

            // Optimistically update to the new value
            queryClient.setQueryData(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }), (old = []) => 
                [...old.filter(a => !removals.includes(a.personId)), ...additions.map(personId => ({ personId, name: 'Loading...' } as { personId: string, name: string })) ]
            )
            return { previousData }
        },
        onError(error, _data, context) {
            // Revert to the previous value
            queryClient.setQueryData(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }), context?.previousData)
            toast({
                title: "Error updating assessees",
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            toast({
                title: "Assessees updated",
                description: `The assessees for this session have been updated: ${result.addCount} added, ${result.removeCount} removed.`,
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillChecks.getSessionAssessees.queryFilter({ sessionId }))
        }
    }))

    function handleCheckedChange(assesseeId: string): (checked: boolean) => void {
        return (checked) => {
            if (checked) {
                // Add the assessee to the selected list
                setSelectedAssessees(prev => [...prev, assesseeId])
                setChanges(prev => {
                    if(prev.removed.includes(assesseeId)) {
                        // If the skill was previously removed, clear the removal
                        return { added: prev.added, removed: prev.removed.filter(id => id !== assesseeId) }
                    } else {
                        return { added: [...prev.added, assesseeId], removed: prev.removed }
                    }
                })
            } else {
                // Remove the assessee from the selected list
                setSelectedAssessees(prev => prev.filter(id => id !== assesseeId))
                setChanges(prev => {
                    if(prev.added.includes(assesseeId)) {
                        // If the skill was previously added, clear the addition
                        return { added: prev.added.filter(id => id !== assesseeId), removed: prev.removed }
                    } else {
                        return { added: prev.added, removed: [...prev.removed, assesseeId] }
                    }
                })
            }
        }
    }

    const isDirty = changes.added.length > 0 || changes.removed.length > 0

    return <>
        <AppPageContent variant="full" hasFooter>
            <ScrollArea style={{ height: `calc(100vh - 98px)` }} className="flex flex-col gap-4 pl-4 pr-3">
                <div className="text-sm text-muted-foreground py-4 space-y-2">
                    <p>
                        Select the team members that should be included as assessees in this competency recorder session.
                    </p>
                    <ul className="text-sm text-muted-foreground">
                        <li><span className="text-green-600 font-mono text-md pr-1">+</span> indicates an unsaved addition</li>
                        <li><span className="text-red-600 font-mono text-md pr-1">-</span> indicates an unsaved removal</li>
                    </ul>
                </div>
                
                <TeamSection
                    team={team}
                    assignedAssessees={assignedAssessees.map(a => a.personId)}
                    selectedAssessees={selectedAssessees}
                    onSelectedChange={handleCheckedChange}
                />
                {/* We could support multiple teams here in future. */}
            </ScrollArea>
        </AppPageContent>
        <AppPageFooter className="justify-between">
            <div className="flex gap-2">
                <AsyncButton 
                    onClick={() => mutation.mutateAsync({ sessionId, additions: changes.added, removals: changes.removed })}
                    disabled={!isDirty}
                    reset
                    label="Save"
                    pending="Saving..."
                />
                <Button 
                    variant="ghost" 
                    disabled={!isDirty}
                    onClick={handleReset}
                >Reset</Button>
            </div>
            <div className="w-16 flex items-center justify-center gap-2">
                {changes.added.length > 0 && <div className="text-green-600">+{changes.added.length}</div>}
                {changes.removed.length > 0 && <div className="text-red-600">-{changes.removed.length}</div>}
            </div>
        </AppPageFooter>
    </>
}

interface TeamSectionProps {
    team: TeamData
    assignedAssessees: string[]
    selectedAssessees: string[]
    onSelectedChange: (assesseeId: string) => (checked: boolean) => void
}

function TeamSection({ team, assignedAssessees, selectedAssessees, onSelectedChange }: TeamSectionProps) {
    const trpc = useTRPC()

    const { data: members } = useSuspenseQuery(trpc.teamMemberships.getTeamMemberships.queryOptions({ teamId: team.teamId }))

    return <div className="border-t py-4">
        <div className="font-semibold text-xl">{team.name}</div>
        <ul className="pl-4">
            {members
                .map(member => <PersonRow
                    key={member.personId}
                    person={member.person}
                    assigned={assignedAssessees.includes(member.personId)}
                    selected={selectedAssessees.includes(member.personId)}
                    onSelectedChange={onSelectedChange(member.personId)}
                />)
            }
        </ul>
    </div>
}

interface PersonRowProps {
    person: { personId: string, name: string }
    assigned: boolean
    selected: boolean
    onSelectedChange: (checked: boolean) => void
}

function PersonRow({ person, assigned, selected, onSelectedChange }: PersonRowProps) {
    return <li className="flex items-center gap-2">
        <Label htmlFor={`person-${person.personId}`} className="py-2 truncate grow">{person.name}</Label>
        <Checkbox
            id={`person-${person.personId}`}
            checked={selected}
            onCheckedChange={onSelectedChange}
        />
        <div className="w-4">
            {selected && !assigned && <span className="text-green-600 font-mono text-md">+</span>}
            {!selected && assigned && <span className="text-red-600 font-mono text-md">-</span>}
        </div>
    </li>
}